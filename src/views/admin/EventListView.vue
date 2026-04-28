<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { createEventColumns } from '@/components/admin/listPageColumns'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
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
import type { EventVO } from '@/api/event'
import { queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

const router = useRouter()
const queryClient = useQueryClient()

const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

const currentPage = ref(1)
const pageSize = ref(10)
const searchName = ref('')
const searchCityId = ref('')
const searchCategoryId = ref('')

const { data: citiesData } = useQuery({
  queryKey: queryKeys.admin.list('cities'),
  queryFn: fetchAdminCities,
})

const { data: categoriesData } = useQuery({
  queryKey: queryKeys.admin.list('categories'),
  queryFn: fetchAdminCategories,
})

const queryKey = computed(() => [
  ...queryKeys.admin.list('events'),
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

const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('events') })

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
  openConfirm('确认删除', `确认删除活动「${row.name}」？`, () => deleteMutation.mutateAsync(row.id))
}

const handlePublish = (row: EventVO) => {
  openConfirm('确认发布', `确认发布活动「${row.name}」？`, () =>
    publishMutation.mutateAsync(row.id),
  )
}

const handleOffline = (row: EventVO) => {
  openConfirm('确认下线', `确认下线活动「${row.name}」？`, () =>
    offlineMutation.mutateAsync(row.id),
  )
}

const columns = createEventColumns({ openEdit, handleDelete, handlePublish, handleOffline })
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
          <SelectTrigger class="h-8 w-28" aria-label="筛选城市">
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
          <SelectTrigger class="h-8 w-28" aria-label="筛选分类">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem v-for="cat in categoriesData ?? []" :key="cat.id" :value="String(cat.id)">
              {{ cat.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          v-model="searchName"
          placeholder="搜索活动名称"
          class="h-8 w-48"
          aria-label="搜索活动名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    :confirm-text="confirmDialog.confirmText"
    :confirm-variant="confirmDialog.confirmVariant"
    :loading="confirmDialog.isProcessing"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
