<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import ImageUpload from '@/components/common/ImageUpload.vue'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import { fetchAdminBanners, createBanner, updateBanner, deleteBanner } from '@/api/event/banner'
import { fetchAdminCities } from '@/api/event/city'
import type { BannerVO, BannerCreateRequest, BannerUpdateRequest, CityVO } from '@/api/event'
import { formatDateTime, formatDateTimeLocalInput } from '@/utils/format'

const queryClient = useQueryClient()

const currentPage = ref(1)
const pageSize = ref(10)
const searchTitle = ref('')
const searchCityId = ref('')

const { data: citiesData } = useQuery({
  queryKey: ['admin-cities'],
  queryFn: fetchAdminCities,
})

const citiesMap = computed(() => {
  const map = new Map<string, CityVO>()
  const cities = citiesData.value ?? []
  cities.forEach((city) => map.set(city.id, city))
  return map
})

const columns: ColumnDef<BannerVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 100,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'title',
    header: '标题',
  },
  {
    accessorKey: 'cityId',
    header: '城市',
    size: 100,
    cell: ({ row }) => {
      const cityId = String(row.getValue('cityId'))
      return citiesMap.value.get(cityId)?.name ?? cityId
    },
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 80,
    cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
  },
  {
    accessorKey: 'displayStartAt',
    header: '展示开始时间',
    size: 160,
    cell: ({ row }) => formatDateTime(row.original.displayStartAt),
  },
  {
    accessorKey: 'displayEndAt',
    header: '展示结束时间',
    size: 160,
    cell: ({ row }) => formatDateTime(row.original.displayEndAt),
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
          { default: () => '编辑' },
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
          { default: () => '删除' },
        ),
      ]),
  },
]

const queryKey = computed(() => [
  'admin-banners',
  currentPage.value,
  pageSize.value,
  searchTitle.value,
  searchCityId.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminBanners({
      page: currentPage.value,
      size: pageSize.value,
      title: searchTitle.value || undefined,
      cityId: searchCityId.value && searchCityId.value !== 'all' ? searchCityId.value : undefined,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

watch([searchTitle, searchCityId], () => {
  currentPage.value = 1
})

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<BannerCreateRequest & { sortOrder?: number }>({
  cityId: '',
  title: '',
  imageUrl: '',
  mobileImageUrl: '',
  jumpUrl: '',
  displayStartAt: '',
  displayEndAt: '',
  sortOrder: 0,
})

const dialogTitle = computed(() => (editingId.value ? '编辑 Banner' : '新建 Banner'))

const resetForm = () => {
  form.cityId = ''
  form.title = ''
  form.imageUrl = ''
  form.mobileImageUrl = ''
  form.jumpUrl = ''
  form.displayStartAt = ''
  form.displayEndAt = ''
  form.sortOrder = 0
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: BannerVO) => {
  form.cityId = row.cityId
  form.title = row.title
  form.imageUrl = row.imageUrl
  form.mobileImageUrl = row.mobileImageUrl
  form.jumpUrl = row.jumpUrl
  form.displayStartAt = formatDateTimeLocalInput(row.displayStartAt)
  form.displayEndAt = formatDateTimeLocalInput(row.displayEndAt)
  form.sortOrder = row.sortOrder
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] })

const createMutation = useMutation({
  mutationFn: (data: BannerCreateRequest) => createBanner(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: BannerUpdateRequest }) => updateBanner(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteBanner(id),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: {
        cityId: form.cityId || undefined,
        title: form.title || undefined,
        imageUrl: form.imageUrl || undefined,
        mobileImageUrl: form.mobileImageUrl || undefined,
        jumpUrl: form.jumpUrl || undefined,
        displayStartAt: form.displayStartAt || undefined,
        displayEndAt: form.displayEndAt || undefined,
        sortOrder: form.sortOrder,
      },
    })
  } else {
    if (
      !form.cityId ||
      !form.title ||
      !form.imageUrl ||
      !form.mobileImageUrl ||
      !form.jumpUrl ||
      !form.displayStartAt ||
      !form.displayEndAt
    )
      return
    await createMutation.mutateAsync({
      cityId: form.cityId,
      title: form.title,
      imageUrl: form.imageUrl,
      mobileImageUrl: form.mobileImageUrl,
      jumpUrl: form.jumpUrl,
      displayStartAt: form.displayStartAt,
      displayEndAt: form.displayEndAt,
      sortOrder: form.sortOrder ?? 0,
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

const handleDelete = (row: BannerVO) => {
  openConfirm('确认删除', `确认删除 Banner「${row.title}」？`, () => deleteMutation.mutate(row.id))
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :current-page="currentPage"
    :total-pages="totalPages"
    :page-size="pageSize"
    :total-row="totalRow"
    title="Banner 管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchCityId">
          <SelectTrigger class="h-8 w-32">
            <SelectValue placeholder="全部城市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部城市</SelectItem>
            <SelectItem v-for="city in citiesData ?? []" :key="city.id" :value="String(city.id)">
              {{ city.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input v-model="searchTitle" placeholder="搜索标题" class="h-8 w-36" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog :open="showDialog" @update:open="(v) => !v && (showDialog = false)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ editingId ? '编辑 Banner 信息' : '创建新的 Banner' }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium">标题 <span class="text-destructive">*</span></label>
            <Input v-model="form.title" placeholder="请输入 Banner 标题" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">城市 <span class="text-destructive">*</span></label>
            <Select v-model="form.cityId">
              <SelectTrigger>
                <SelectValue placeholder="请选择城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="city in citiesData ?? []"
                  :key="city.id"
                  :value="String(city.id)"
                >
                  {{ city.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium"
              >PC 端图片 <span class="text-destructive">*</span></label
            >
            <ImageUpload v-model="form.imageUrl" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium"
              >移动端图片 <span class="text-destructive">*</span></label
            >
            <ImageUpload v-model="form.mobileImageUrl" />
          </div>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium"
            >跳转 URL <span class="text-destructive">*</span></label
          >
          <Input v-model="form.jumpUrl" placeholder="请输入跳转链接" />
        </div>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium">展示开始时间</label>
            <DateTimePicker v-model="form.displayStartAt" placeholder="选择展示开始时间" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">展示结束时间</label>
            <DateTimePicker v-model="form.displayEndAt" placeholder="选择展示结束时间" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">排序</label>
            <Input v-model.number="form.sortOrder" type="number" placeholder="排序值" />
          </div>
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
