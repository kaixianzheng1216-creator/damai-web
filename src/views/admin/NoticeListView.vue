<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { fetchAdminNoticesPage, createNotice, updateNotice, deleteNotice } from '@/api/event/notice'
import type { NoticeVO, NoticeCreateRequest, NoticeUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const noticeTypeMap: Record<number, string> = {
  1: '购票须知',
  2: '入场须知',
}

const columns: ColumnDef<NoticeVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'type',
    header: '类型',
    size: 120,
    cell: ({ row }) => {
      const type = row.original.type
      return h(
        Badge,
        { class: 'bg-transparent text-foreground border border-border' },
        () => noticeTypeMap[type] ?? type,
      )
    },
  },
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 100,
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
const searchType = ref('')

const queryKey = computed(() => [
  'admin-notices',
  currentPage.value,
  pageSize.value,
  searchName.value,
  searchType.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminNoticesPage({
      page: currentPage.value,
      size: pageSize.value,
      name: searchName.value || undefined,
      type: searchType.value && searchType.value !== 'all' ? Number(searchType.value) : undefined,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<{
  type: number
  name: string
  sortOrder: number | undefined
}>({
  type: 1,
  name: '',
  sortOrder: undefined,
})

const dialogTitle = computed(() => (editingId.value ? '编辑须知' : '新建须知'))

const resetForm = () => {
  form.type = 1
  form.name = ''
  form.sortOrder = undefined
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: NoticeVO) => {
  form.type = row.type
  form.name = row.name
  form.sortOrder = row.sortOrder
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-notices'] })

watch([searchName, searchType], () => {
  currentPage.value = 1
})

const createMutation = useMutation({
  mutationFn: (data: NoticeCreateRequest) => createNotice(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: NoticeUpdateRequest }) => updateNotice(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteNotice(id),
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
      type: form.type,
      name: form.name,
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

const handleDelete = (row: NoticeVO) => {
  openConfirm('确认删除', `确认删除须知「${row.name}」？`, () => deleteMutation.mutate(row.id))
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
    title="须知管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchType">
          <SelectTrigger class="h-8 w-28">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="1">购票须知</SelectItem>
            <SelectItem value="2">入场须知</SelectItem>
          </SelectContent>
        </Select>
        <Input v-model="searchName" placeholder="搜索须知名称" class="h-8 w-40" />
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
          <label class="text-sm font-medium">类型 <span class="text-destructive">*</span></label>
          <Select
            :model-value="String(form.type)"
            :disabled="!!editingId"
            @update:model-value="(v) => (form.type = Number(v))"
          >
            <SelectTrigger>
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">购票须知</SelectItem>
              <SelectItem value="2">入场须知</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">名称 <span class="text-destructive">*</span></label>
          <Input v-model="form.name" placeholder="请输入须知名称" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">排序</label>
          <Input
            v-model.number="form.sortOrder"
            type="number"
            placeholder="排序权重（可选，数值越小越靠前）"
          />
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
