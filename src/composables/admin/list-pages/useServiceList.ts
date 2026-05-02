import { computed, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchAdminServicesPage } from '@/api/event/service'
import type { ServiceGuaranteeVO } from '@/api/event'
import { queryKeys } from '@/constants'

const adminServicesQueryKey = queryKeys.admin.list('services')

export function useServiceList() {
  const queryClient = useQueryClient()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchName = ref('')

  const queryKey = computed(() => [
    ...adminServicesQueryKey,
    currentPage.value,
    pageSize.value,
    searchName.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminServicesPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))
  const selectedService = ref<ServiceGuaranteeVO | null>(null)
  const currentOptions = computed(() => selectedService.value?.options ?? [])

  const syncSelectedService = () => {
    const serviceId = selectedService.value?.id
    if (!serviceId) return
    const fresh = list.value.find((service) => service.id === serviceId)
    if (fresh) selectedService.value = fresh
  }

  const invalidate = () => {
    return queryClient
      .invalidateQueries({ queryKey: adminServicesQueryKey })
      .then(syncSelectedService)
  }

  watch(searchName, () => {
    currentPage.value = 1
  })

  return {
    currentPage,
    pageSize,
    searchName,
    isLoading,
    list,
    totalRow,
    totalPages,
    selectedService,
    currentOptions,
    invalidate,
  }
}
