<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { fetchAdminEventPage, deleteEvent, publishEvent, offlineEvent } from '@/api/event/event'
import { fetchAdminCities } from '@/api/event/city'
import { fetchAdminCategories } from '@/api/event/category'
import { formatPrice } from '@/utils/format'
import type { EventVO } from '@/api/event'

const router = useRouter()
const queryClient = useQueryClient()

const currentPage = ref(1)
const pageSize = ref(10)
const searchName = ref('')
const searchCityId = ref('')
const searchCategoryId = ref('')

const { data: citiesData } = useQuery({
  queryKey: ['admin-cities-all'],
  queryFn: fetchAdminCities,
})

const { data: categoriesData } = useQuery({
  queryKey: ['admin-categories-all'],
  queryFn: fetchAdminCategories,
})

const columns: ColumnDef<EventVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 100,
  },
  {
    accessorKey: 'name',
    header: '活动名称',
  },
  {
    accessorKey: 'cityNameSnapshot',
    header: '城市',
    size: 100,
  },
  {
    accessorKey: 'categoryNameSnapshot',
    header: '分类',
    size: 100,
  },
  {
    accessorKey: 'minPrice',
    header: '最低票价',
    size: 120,
    cell: ({ row }) => {
      return row.original.minPrice != null ? formatPrice(row.original.minPrice) : '-'
    },
  },
  {
    accessorKey: 'statusLabel',
    header: '状态',
    size: 100,
    cell: ({ row }) => {
      return h(Badge, { variant: 'outline' }, { default: () => row.original.statusLabel })
    },
  },
  {
    accessorKey: 'recommendWeight',
    header: '推荐权重',
    size: 100,
    cell: ({ row }) => {
      return row.original.recommendWeight ?? '-'
    },
  },
  {
    id: 'actions',
    header: '操作',
    size: 280,
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex items-center gap-2' },
        [
          h(
            Button,
            {
              variant: 'outline',
              size: 'sm',
              onClick: (e: Event) => {
                e.stopPropagation()
                openEdit(row.original)
              },
            },
            () => '编辑',
          ),
          row.original.status === 0
            ? h(
                Button,
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    handlePublish(row.original)
                  },
                },
                () => '发布',
              )
            : null,
          row.original.status === 1
            ? h(
                Button,
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    handleOffline(row.original)
                  },
                },
                () => '下线',
              )
            : null,
          row.original.status === 2
            ? h(
                Button,
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    handlePublish(row.original)
                  },
                },
                () => '上线',
              )
            : null,
          h(
            Button,
            {
              variant: 'destructive',
              size: 'sm',
              onClick: (e: Event) => {
                e.stopPropagation()
                handleDelete(row.original)
              },
            },
            () => '删除',
          ),
        ].filter(Boolean),
      )
    },
  },
]

const queryKey = computed(() => [
  'admin-events',
  currentPage.value,
  searchName.value,
  searchCityId.value,
  searchCategoryId.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminEventPage({
      name: searchName.value || undefined,
      cityId: searchCityId.value && searchCityId.value !== 'all' ? searchCityId.value : undefined,
      categoryId:
        searchCategoryId.value && searchCategoryId.value !== 'all'
          ? searchCategoryId.value
          : undefined,
      page: currentPage.value,
      size: pageSize.value,
    }),
})

watch([searchName, searchCityId, searchCategoryId], () => {
  currentPage.value = 1
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-events'] })

const openCreate = () => {
  router.push('/admin/events/create')
}

const openEdit = (row: EventVO) => {
  router.push(`/admin/events/${row.id}/edit`)
}

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteEvent(id),
  onSuccess: invalidate,
})

const publishMutation = useMutation({
  mutationFn: (id: string) => publishEvent(id),
  onSuccess: invalidate,
})

const offlineMutation = useMutation({
  mutationFn: (id: string) => offlineEvent(id),
  onSuccess: invalidate,
})

const handleDelete = (row: EventVO) => {
  openConfirm('确认删除', `确认删除活动「${row.name}」？`, () => deleteMutation.mutate(row.id))
}

const handlePublish = (row: EventVO) => {
  openConfirm('确认发布', `确认发布活动「${row.name}」？`, () => publishMutation.mutate(row.id))
}

const handleOffline = (row: EventVO) => {
  openConfirm('确认下线', `确认下线活动「${row.name}」？`, () => offlineMutation.mutate(row.id))
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
    title="活动管理"
    @create="openCreate"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchCityId">
          <SelectTrigger class="h-8 w-28">
            <SelectValue placeholder="全部城市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部城市</SelectItem>
            <SelectItem v-for="city in citiesData ?? []" :key="city.id" :value="String(city.id)">
              {{ city.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="searchCategoryId">
          <SelectTrigger class="h-8 w-28">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem v-for="cat in categoriesData ?? []" :key="cat.id" :value="String(cat.id)">
              {{ cat.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input v-model="searchName" placeholder="搜索活动名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
