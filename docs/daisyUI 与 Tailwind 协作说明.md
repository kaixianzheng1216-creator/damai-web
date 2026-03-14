# daisyUI 与 Tailwind CSS 协作规范

本项目采用了 **daisyUI** 作为 UI 组件库，结合 **Tailwind CSS** 作为原子化 CSS 引擎。daisyUI 是一个基于 Tailwind CSS 的插件，提供了一套语义化的组件类名，使得 HTML 结构更加清晰。

## 核心理念

- **纯 CSS 组件**：daisyUI 的组件（如按钮、卡片、模态框）完全由 CSS 类名控制，不需要引入 JavaScript 组件（除了极少数交互可能需要简单的 JS 辅助，或使用 `v-model` 绑定）。
- **语义化类名**：使用如 `btn`, `card`, `modal` 等语义化类名，而不是堆砌大量的 Tailwind 原子类。
- **主题化**：通过 Tailwind 配置文件或 HTML 标签上的 `data-theme` 属性轻松切换主题。

## 最佳实践

### 1. 使用 daisyUI 组件类名

直接在 HTML 元素上使用 daisyUI 提供的组件类名。

**示例 (按钮):**

```vue
<template>
  <button class="btn btn-primary">主要按钮</button>
  <button class="btn btn-secondary">次要按钮</button>
  <button class="btn btn-accent">强调按钮</button>
</template>
```

**示例 (卡片):**

```vue
<template>
  <div class="card w-96 bg-base-100 shadow-xl">
    <figure><img src="https://placehold.co/400x200" alt="Shoes" /></figure>
    <div class="card-body">
      <h2 class="card-title">Shoes!</h2>
      <p>If a dog chews shoes whose shoes does he choose?</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary">Buy Now</button>
      </div>
    </div>
  </div>
</template>
```

### 2. 结合 Tailwind 原子类进行微调

daisyUI 提供了组件的骨架和样式，但布局（Layout）、间距（Spacing）、尺寸（Sizing）等仍然需要使用 Tailwind 的原子类。

**推荐:**

```vue
<template>
  <!-- 使用 flex 布局，gap-4 控制间距，p-4 控制内边距 -->
  <div class="flex flex-col gap-4 p-4">
    <div class="alert alert-info">
      <span>New software update available.</span>
    </div>

    <div class="flex justify-end">
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</template>
```

### 3. 交互与状态管理

由于 daisyUI 是纯 CSS 组件库，对于需要 JS 交互的组件（如 Modal, Dropdown, Drawer），通常结合 Vue 的状态管理来实现。

**Modal 示例:**

虽然 daisyUI 提供了纯 CSS 的 Modal（利用 `<dialog>` 或 `checkbox` hack），但在 Vue 中推荐使用 `<dialog>` 配合 `ref` 操作，或者使用条件渲染。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const myModal = ref<HTMLDialogElement | null>(null)

const openModal = () => {
  myModal.value?.showModal()
}
</script>

<template>
  <button class="btn" @click="openModal">Open Modal</button>

  <dialog ref="myModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Hello!</h3>
      <p class="py-4">Press ESC key or click the button below to close</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
```

### 4. 消息提示 (Toast)

daisyUI 有 `toast` 组件用于布局，但为了更好的编程式调用体验，本项目集成了 **vue3-toastify**。

**使用方法:**

```typescript
import { toast } from 'vue3-toastify'

toast.success('操作成功')
toast.error('操作失败')
```

## 注意事项

1. **避免手动编写复杂 CSS**：尽量使用 daisyUI 组件 + Tailwind 原子类解决所有样式问题。
2. **查阅文档**：daisyUI 提供了丰富的组件变体，编写代码前请查阅 [daisyUI 官方文档](https://daisyui.com/)。
3. **图标使用**：本项目配置了 `unplugin-icons`，可以使用 Iconify 图标库。推荐使用 `@iconify-json/heroicons` 或其他集合（需安装对应依赖）。
