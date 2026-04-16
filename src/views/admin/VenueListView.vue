<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { fetchAdminVenues, createVenue, updateVenue, deleteVenue } from '@/api/event/venue'
import type { VenueVO, VenueCreateRequest, VenueUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const columns: ColumnDef<VenueVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '场馆名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'province',
    header: '省份',
    size: 100,
    cell: ({ row }) => String(row.getValue('province') ?? ''),
  },
  {
    accessorKey: 'city',
    header: '城市',
    size: 100,
    cell: ({ row }) => String(row.getValue('city') ?? ''),
  },
  {
    accessorKey: 'district',
    header: '区县',
    size: 100,
    cell: ({ row }) => String(row.getValue('district') ?? ''),
  },
  {
    accessorKey: 'address',
    header: '地址',
    cell: ({ row }) => String(row.getValue('address') ?? ''),
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
  queryKey: ['admin-venues'],
  queryFn: fetchAdminVenues,
})

const list = computed(() => data.value ?? [])

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<VenueCreateRequest>({
  name: '',
  province: '',
  city: '',
  district: '',
  address: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑场馆' : '新建场馆'))

const resetForm = () => {
  form.name = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.address = ''
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: VenueVO) => {
  form.name = row.name
  form.province = row.province
  form.city = row.city
  form.district = row.district
  form.address = row.address
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-venues'] })

const createMutation = useMutation({
  mutationFn: (data: VenueCreateRequest) => createVenue(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: VenueUpdateRequest }) => updateVenue(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteVenue(id),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: {
        name: form.name || undefined,
        province: form.province || undefined,
        city: form.city || undefined,
        district: form.district || undefined,
        address: form.address || undefined,
      },
    })
  } else {
    if (!form.name || !form.province || !form.city || !form.address) return
    await createMutation.mutateAsync({ ...form })
  }
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }

const handleDelete = (row: VenueVO) => {
  openConfirm('确认删除', `确认删除场馆「${row.name}」？`, () => deleteMutation.mutate(row.id))
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    title="场馆管理"
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
          <label class="text-sm font-medium">场馆名 <span class="text-destructive">*</span></label>
          <Input v-model="form.name" placeholder="请输入场馆名" />
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">省份 <span class="text-destructive">*</span></label>
            <Input v-model="form.province" placeholder="省份" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">城市 <span class="text-destructive">*</span></label>
            <Input v-model="form.city" placeholder="城市" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">区县</label>
            <Input v-model="form.district" placeholder="区县" />
          </div>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium"
            >详细地址 <span class="text-destructive">*</span></label
          >
          <Input v-model="form.address" placeholder="请输入详细地址" />
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
