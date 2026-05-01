# Dialog 使用规范

## 1. 核心原则

### 1.1 禁止 `v-if` + `:open` 混用

**错误** ❌

```vue
<MyDialog v-if="showDialog" :open="showDialog" />
```

**正确** ✅

```vue
<MyDialog :open="showDialog" @update:open="showDialog = $event" />
```

**原因**：`v-if` 会直接销毁组件，跳过 Dialog 内部的退出动画和副作用清理（scroll lock、pointer-events、focus trap），导致页面卡死或变黑。

### 1.2 所有业务 Dialog 使用 `useDialog` 管理状态

```ts
import { useDialog } from '@/composables/common'

export function useXxxDialog() {
  const { open, data, isLoading, openDialog, closeDialog, withLoading } = useDialog<XxxVO>()

  const submit = async () => {
    await withLoading(async () => {
      await api.submit(data.value!.id)
      closeDialog()
    })
  }

  return {
    open,
    data,
    isLoading,
    openDialog,
    closeDialog,
    submit,
  }
}
```

### 1.3 命名统一

| 角色         | 命名                   |
| ------------ | ---------------------- |
| 弹窗开关状态 | `open`                 |
| 打开方法     | `openDialog(payload?)` |
| 关闭方法     | `closeDialog()`        |
| 加载状态     | `isLoading`            |
| 数据载荷     | `data`                 |

---

## 2. 组件模板

### 2.1 简单确认弹窗

参考：`src/components/_templates/DialogTemplate.vue`

```vue
<script setup>
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <DialogTemplate
    :open="open"
    title="确认删除"
    confirm-text="删除"
    confirm-variant="destructive"
    @close="emit('close')"
    @confirm="emit('confirm')"
  >
    <p>确认删除该项目？删除后不可恢复。</p>
  </DialogTemplate>
</template>
```

### 2.2 表单弹窗

参考：`src/components/_templates/FormDialogTemplate.vue`

```vue
<script setup>
const props = defineProps<{ open: boolean; isSaving?: boolean }>()
const emit = defineEmits<{ close: []; submit: [] }>()
const form = defineModel('form', { required: true })
</script>

<template>
  <FormDialogTemplate
    :open="open"
    :title="dialogTitle"
    :is-saving="isSaving"
    @close="emit('close')"
    @submit="emit('submit')"
  >
    <Input v-model="form.name" placeholder="名称" />
    <Input v-model="form.price" type="number" placeholder="价格" />
  </FormDialogTemplate>
</template>
```

---

## 3. 关闭逻辑规范

### 3.1 点击关闭按钮

```vue
const handleOpenChange = (value: boolean) => { if (!value && !isLoading.value) { emit('close') } }
```

### 3.2 操作成功后关闭

```ts
const submit = async () => {
  await withLoading(async () => {
    await api.create(form.value)
    closeDialog() // 先关弹窗
    toast.success('创建成功')
    invalidateQueries() // 再刷新列表
  })
}
```

### 3.3 禁止在 `onSuccess` 中直接操作 DOM 关闭

**错误** ❌

```ts
const mutation = useMutation({
  mutationFn: api.close,
  onSuccess: () => {
    showDialog.value = false // 可能跳过动画清理
  },
})
```

**正确** ✅

```ts
const confirmClose = async () => {
  await mutation.mutateAsync(id)
  closeDialog() // 使用 useDialog 的 closeDialog
}
```

---

## 4. 二次确认规范

### 4.1 推荐：内联确认按钮

```vue
<template>
  <Button variant="destructive" @click="handleDelete">
    {{ confirmDelete ? '确认删除' : '删除' }}
  </Button>
</template>

<script setup>
const confirmDelete = ref(false)
const handleDelete = () => {
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  deleteMutation.mutate()
}
</script>
```

### 4.2 允许：使用 `useConfirmDialog`

```ts
const { openConfirm } = useConfirmDialog()

const handleDelete = (item) => {
  openConfirm('删除确认', `确认删除「${item.name}」？`, () => {
    return deleteMutation.mutateAsync(item.id)
  })
}
```

### 4.3 禁止：Dialog 套 Dialog

两个 `Dialog`/`AlertDialog` 同时 open 会导致 `DismissableLayer` 冲突，出现 `pointer-events: none` 残留。

---

## 5. Props / Events 规范

### 5.1 Dialog 组件必须暴露的接口

```ts
defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
  confirm: [] // 确认/提交类弹窗
  submit: [] // 表单类弹窗
}>()
```

### 5.2 父组件调用方式

```vue
<template>
  <MyDialog :open="dialog.open.value" @update:open="dialog.closeDialog" @confirm="dialog.submit" />
</template>

<script setup>
const dialog = useMyDialog()
</script>
```

---

## 6. 样式规范

### 6.1 弹窗宽度

| 场景          | 宽度类                            |
| ------------- | --------------------------------- |
| 简单确认      | `max-w-sm` (384px)                |
| 表单弹窗      | `max-w-md` (448px)                |
| 详情/复杂内容 | `max-w-lg` (512px) 或 `max-w-3xl` |
| 全屏表格      | `max-w-4xl` (896px)               |

### 6.2 移动端适配

所有 Dialog 必须包含 `w-[calc(100vw-2rem)]` 防止移动端溢出：

```vue
<DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
```

---

## 7. 新增 Dialog checklist

- [ ] 状态使用 `useDialog()` 管理
- [ ] 无 `v-if` 控制 Dialog 挂载
- [ ] props 包含 `open: boolean`
- [ ] emits 包含 `close` + `confirm`/`submit`
- [ ] 有 `handleOpenChange` 拦截关闭（如 loading 中禁止关闭）
- [ ] 移动端宽度适配 `w-[calc(100vw-2rem)]`
- [ ] 操作成功后先 `closeDialog()` 再 toast/刷新
- [ ] 不与其他 Dialog 同时 open

---

## 8. 参考文件

- 通用封装：`src/composables/common/useDialog.ts`
- 确认弹窗：`src/composables/common/useConfirmDialog.ts`
- 模板：`src/components/_templates/DialogTemplate.vue`
- 表单模板：`src/components/_templates/FormDialogTemplate.vue`
- 规范文档：`docs/ui-guidelines.md`
