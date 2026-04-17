<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
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
import {
  fetchAdminCitiesPage,
  createCity,
  updateCity,
  deleteCity,
  updateCityFeatured,
} from '@/api/event/city'
import type { CityVO, CityCreateRequest, CityUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const columns: ColumnDef<CityVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '城市名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'pinyin',
    header: '拼音',
    cell: ({ row }) => String(row.getValue('pinyin')),
  },
  {
    accessorKey: 'firstLetter',
    header: '首字母',
    size: 80,
    cell: ({ row }) => String(row.getValue('firstLetter')),
  },
  {
    accessorKey: 'isFeatured',
    header: '热门',
    size: 100,
    cell: ({ row }) => {
      const isFeatured = row.getValue('isFeatured') as number
      return h(
        Button,
        {
          size: 'sm',
          variant: isFeatured === 1 ? 'default' : 'outline',
          class: 'h-6 px-2 text-xs',
          onClick: () => toggleFeatured(row.original),
        },
        () => (isFeatured === 1 ? '热门' : '普通'),
      )
    },
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

const queryKey = computed(() => ['admin-cities', currentPage.value, pageSize.value, searchName.value])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () => fetchAdminCitiesPage({ page: currentPage.value, size: pageSize.value, name: searchName.value || undefined }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<CityCreateRequest>({
  name: '',
  pinyin: '',
  firstLetter: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑城市' : '新建城市'))

const resetForm = () => {
  form.name = ''
  form.pinyin = ''
  form.firstLetter = ''
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: CityVO) => {
  form.name = row.name
  form.pinyin = row.pinyin
  form.firstLetter = row.firstLetter
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-cities'] })

watch(searchName, () => { currentPage.value = 1 })

const createMutation = useMutation({
  mutationFn: (data: CityCreateRequest) => createCity(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: CityUpdateRequest }) => updateCity(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteCity(id),
  onSuccess: invalidate,
})

const featuredMutation = useMutation({
  mutationFn: ({ id, isFeatured }: { id: string; isFeatured: number }) =>
    updateCityFeatured(id, isFeatured),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: {
        name: form.name || undefined,
        pinyin: form.pinyin || undefined,
        firstLetter: form.firstLetter || undefined,
      },
    })
  } else {
    if (!form.name || !form.pinyin || !form.firstLetter) return
    await createMutation.mutateAsync({
      name: form.name,
      pinyin: form.pinyin,
      firstLetter: form.firstLetter,
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

const handleDelete = (row: CityVO) => {
  openConfirm('确认删除', `确认删除城市「${row.name}」？`, () => deleteMutation.mutate(row.id))
}

const toggleFeatured = (row: CityVO) => {
  const newValue = row.isFeatured === 1 ? 0 : 1
  featuredMutation.mutate({ id: row.id, isFeatured: newValue })
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
    title="城市管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex items-center gap-2">
        <Input v-model="searchName" placeholder="搜索城市名称" class="h-8 w-48" />
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
          <label class="text-sm font-medium">城市名 <span class="text-destructive">*</span></label>
          <Input v-model="form.name" placeholder="请输入城市名" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">拼音 <span class="text-destructive">*</span></label>
          <Input v-model="form.pinyin" placeholder="请输入拼音，如 beijing" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">首字母 <span class="text-destructive">*</span></label>
          <Input v-model="form.firstLetter" placeholder="请输入首字母，如 B" maxlength="1" />
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
