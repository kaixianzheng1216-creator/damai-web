<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { fetchAdminBanners, createBanner, updateBanner, deleteBanner } from '@/api/event/banner'
import type { BannerVO, BannerCreateRequest, BannerUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const currentPage = ref(1)
const pageSize = ref(10)
const searchTitle = ref('')

const columns: ColumnDef<BannerVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'title',
    header: '标题',
  },
  {
    accessorKey: 'cityId',
    header: '城市ID',
    size: 180,
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 80,
  },
  {
    accessorKey: 'displayStartAt',
    header: '展示开始时间',
    size: 160,
  },
  {
    accessorKey: 'displayEndAt',
    header: '展示结束时间',
    size: 160,
  },
]

const queryKey = computed(() => [
  'admin-banners',
  currentPage.value,
  pageSize.value,
  searchTitle.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminBanners({
      page: currentPage.value,
      size: pageSize.value,
      title: searchTitle.value || undefined,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => data.value?.totalRow ?? 0)
const totalPages = computed(() => data.value?.totalPage ?? 1)

const handleSearch = () => {
  currentPage.value = 1
}

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<BannerCreateRequest & { sortOrder?: number }>({
  cityId: '',
  title: '',
  imageUrl: '',
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
  form.jumpUrl = row.jumpUrl
  form.displayStartAt = row.displayStartAt
  form.displayEndAt = row.displayEndAt
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
        jumpUrl: form.jumpUrl || undefined,
        displayStartAt: form.displayStartAt || undefined,
        displayEndAt: form.displayEndAt || undefined,
        sortOrder: form.sortOrder,
      },
    })
  } else {
    if (!form.cityId || !form.title || !form.imageUrl || !form.jumpUrl) return
    await createMutation.mutateAsync({
      cityId: form.cityId,
      title: form.title,
      imageUrl: form.imageUrl,
      jumpUrl: form.jumpUrl,
      displayStartAt: form.displayStartAt,
      displayEndAt: form.displayEndAt,
    })
  }
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }

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
      <div class="flex items-center gap-2">
        <Input
          v-model="searchTitle"
          placeholder="搜索标题"
          class="h-8 w-36"
          @keyup.enter="handleSearch"
        />
        <Button size="sm" variant="outline" @click="handleSearch">搜索</Button>
        <Button size="sm" @click="openCreate">
          <icon-lucide-plus class="mr-1.5 h-4 w-4" />
          新建
        </Button>
      </div>
    </template>
  </DataTableCrud>

  <Dialog :open="showDialog" @update:open="(v) => !v && (showDialog = false)">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label class="text-sm font-medium">标题 <span class="text-destructive">*</span></label>
          <Input v-model="form.title" placeholder="请输入 Banner 标题" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">城市ID <span class="text-destructive">*</span></label>
          <Input v-model="form.cityId" placeholder="请输入城市 ID" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">图片 <span class="text-destructive">*</span></label>
          <ImageUpload v-model="form.imageUrl" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">跳转 URL <span class="text-destructive">*</span></label>
          <Input v-model="form.jumpUrl" placeholder="请输入跳转链接" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">展示开始时间</label>
            <input
              v-model="form.displayStartAt"
              type="datetime-local"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">展示结束时间</label>
            <input
              v-model="form.displayEndAt"
              type="datetime-local"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <div v-if="editingId" class="grid gap-2">
          <label class="text-sm font-medium">排序</label>
          <Input v-model.number="form.sortOrder" type="number" placeholder="排序值" />
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
