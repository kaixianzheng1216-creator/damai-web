import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { deleteEvent, fetchAdminEventPage, offlineEvent, publishEvent } from '@/api/event/event'
import { fetchAdminCategories } from '@/api/event/category'
import { fetchAdminCities } from '@/api/event/city'
import type { EventVO } from '@/api/event'
import { queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

const adminEventsQueryKey = queryKeys.admin.list('events')
const adminCitiesQueryKey = queryKeys.admin.list('cities')
const adminCategoriesQueryKey = queryKeys.admin.list('categories')

export function useAdminEventListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchName = ref('')
  const searchCityId = ref('')
  const searchCategoryId = ref('')

  const { data: citiesData } = useQuery({
    queryKey: adminCitiesQueryKey,
    queryFn: fetchAdminCities,
  })

  const { data: categoriesData } = useQuery({
    queryKey: adminCategoriesQueryKey,
    queryFn: fetchAdminCategories,
  })

  const queryKey = computed(() => [
    ...adminEventsQueryKey,
    currentPage.value,
    pageSize.value,
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

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  watch([searchName, searchCityId, searchCategoryId], () => {
    currentPage.value = 1
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminEventsQueryKey })

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
    openConfirm('确认删除', `确认删除活动「${row.name}」？`, () =>
      deleteMutation.mutateAsync(row.id),
    )
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

  return {
    currentPage,
    pageSize,
    searchName,
    searchCityId,
    searchCategoryId,
    citiesData,
    categoriesData,
    isLoading,
    list,
    totalRow,
    totalPages,
    confirmDialog,
    deleteMutation,
    publishMutation,
    offlineMutation,
    openCreate,
    openEdit,
    handleDelete,
    handlePublish,
    handleOffline,
    closeConfirm,
    handleConfirm,
  }
}
