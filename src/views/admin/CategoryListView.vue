<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/event/category'
import type { CategoryVO, CategoryCreateRequest, CategoryUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const columns: ColumnDef<CategoryVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '分类名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 80,
    cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
  },
  {
    accessorKey: 'parentId',
    header: '父分类ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('parentId') ?? ''),
  },
  {
    id: 'actions',
    header: '操作',
    size: 120,
    cell: ({ row }) => h('div', { class: 'flex items-center justify-end gap-1' }, [
      h(Button, {
        variant: 'ghost',
        size: 'sm',
        class: 'h-7 px-2 text-muted-foreground hover:text-foreground',
        onClick: () => openEdit(row.original),
      }, () => [
        h('icon-lucide-pencil', { class: 'h-3.5 w-3.5' }),
        h('span', { class: 'ml-1 text-xs' }, '编辑'),
      ]),
      h(Button, {
        variant: 'ghost',
        size: 'sm',
        class: 'h-7 px-2 text-muted-foreground hover:text-destructive',
        onClick: () => handleDelete(row.original),
      }, () => [
        h('icon-lucide-trash2', { class: 'h-3.5 w-3.5' }),
        h('span', { class: 'ml-1 text-xs' }, '删除'),
      ]),
    ]),
  },
]

const { data, isLoading } = useQuery({
  queryKey: ['admin-categories'],
  queryFn: fetchAdminCategories,
})

const list = computed(() => data.value ?? [])

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  sortOrder: 0,
  parentId: '0',
})

const dialogTitle = computed(() => (editingId.value ? '编辑分类' : '新建分类'))

const resetForm = () => {
  form.name = ''
  form.sortOrder = 0
  form.parentId = '0'
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: CategoryVO) => {
  form.name = row.name
  form.sortOrder = row.sortOrder
  form.parentId = row.parentId
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] })

const createMutation = useMutation({
  mutationFn: (data: CategoryCreateRequest) => createCategory(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
    updateCategory(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteCategory(id),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: {
        name: form.name || undefined,
        sortOrder: form.sortOrder,
      },
    })
  } else {
    if (!form.name) return
    await createMutation.mutateAsync({
      name: form.name,
      parentId: form.parentId || '0',
      sortOrder: form.sortOrder,
    })
  }
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }

const handleDelete = (row: CategoryVO) => {
  openConfirm('确认删除', `确认删除分类「${row.name}」？`, () => deleteMutation.mutate(row.id))
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    title="分类管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
  />

  <Dialog :open="showDialog" @update:open="(v) => !v && (showDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label class="text-sm font-medium">分类名 <span class="text-destructive">*</span></label>
          <Input v-model="form.name" placeholder="请输入分类名" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">排序</label>
          <Input
            v-model.number="form.sortOrder"
            type="number"
            placeholder="请输入排序值（数字越小越靠前）"
          />
        </div>
        <div v-if="!editingId" class="grid gap-2">
          <label class="text-sm font-medium">父分类ID</label>
          <Input v-model="form.parentId" placeholder="父分类ID，根分类为 0" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showDialog = false">取消</Button>
        <Button
          :disabled="createMutation.isPending.value || updateMutation.isPending.value"
          @click="handleSubmit"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog :open="confirmDialog.open" :title="confirmDialog.title"
    :description="confirmDialog.description" @close="closeConfirm" @confirm="handleConfirm" />
</template>
