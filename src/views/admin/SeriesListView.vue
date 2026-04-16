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
import { fetchAdminSeries, createSeries, updateSeries, deleteSeries } from '@/api/event/series'
import type { SeriesEventVO, SeriesCreateRequest, SeriesUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const columns: ColumnDef<SeriesEventVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '系列名称',
    cell: ({ row }) => String(row.getValue('name')),
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
  queryKey: ['admin-series'],
  queryFn: fetchAdminSeries,
})

const list = computed(() => data.value ?? [])

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<SeriesCreateRequest & SeriesUpdateRequest>({
  name: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑系列' : '新建系列'))

const resetForm = () => {
  form.name = ''
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: SeriesEventVO) => {
  form.name = row.name
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-series'] })

const createMutation = useMutation({
  mutationFn: (data: SeriesCreateRequest) => createSeries(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: SeriesUpdateRequest }) => updateSeries(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteSeries(id),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: { name: form.name || undefined },
    })
  } else {
    if (!form.name) return
    await createMutation.mutateAsync({ name: form.name })
  }
}

const handleDelete = (row: SeriesEventVO) => {
  deleteMutation.mutate(row.id)
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    title="系列管理"
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
          <label class="text-sm font-medium"
            >系列名称 <span class="text-destructive">*</span></label
          >
          <Input v-model="form.name" placeholder="请输入系列名称" />
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
</template>
