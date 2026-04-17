<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
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
  fetchAdminCategoriesPage,
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
    size: 160,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: (e: Event) => {
              e.stopPropagation()
              openEdit(row.original)
            },
          },
          () => '编辑',
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            onClick: (e: Event) => {
              e.stopPropagation()
              handleDelete(row.original)
            },
          },
          () => '删除',
        ),
      ]),
  },
]

const currentPage = ref(1)
const pageSize = ref(10)
const searchName = ref('')

const queryKey = computed(() => ['admin-categories', currentPage.value, pageSize.value, searchName.value])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () => fetchAdminCategoriesPage({ page: currentPage.value, size: pageSize.value, name: searchName.value || undefined }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

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

watch(searchName, () => { currentPage.value = 1 })

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
const closeConfirm = () => {
  confirmDialog.value.open = false
}
const handleConfirm = () => {
  confirmDialog.value.onConfirm()
  closeConfirm()
}

const handleDelete = (row: CategoryVO) => {
  openConfirm('确认删除', `确认删除分类「${row.name}」？`, () => deleteMutation.mutate(row.id))
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :total-row="totalRow"
    :total-pages="totalPages"
    :current-page="currentPage"
    :page-size="pageSize"
    title="分类管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex items-center gap-2">
        <Input v-model="searchName" placeholder="搜索分类名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

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

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
