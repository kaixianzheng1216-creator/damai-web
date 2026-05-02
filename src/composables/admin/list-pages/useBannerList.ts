import { computed, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchAdminBanners } from '@/api/event/banner'
import { fetchAdminCities } from '@/api/event/city'
import type { CityVO } from '@/api/event'
import { queryKeys } from '@/constants'

const adminBannersQueryKey = queryKeys.admin.list('banners')
const adminCitiesQueryKey = queryKeys.admin.list('cities')

export function useBannerList() {
  const queryClient = useQueryClient()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchTitle = ref('')
  const searchCityId = ref('')

  const { data: citiesData } = useQuery({
    queryKey: adminCitiesQueryKey,
    queryFn: fetchAdminCities,
  })

  const citiesMap = computed(() => {
    const map = new Map<string, CityVO>()
    const cities = citiesData.value ?? []
    cities.forEach((city) => map.set(city.id, city))
    return map
  })

  const queryKey = computed(() => [
    ...adminBannersQueryKey,
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminBannersQueryKey })

  watch([searchTitle, searchCityId], () => {
    currentPage.value = 1
  })

  return {
    currentPage,
    pageSize,
    searchTitle,
    searchCityId,
    citiesData,
    citiesMap,
    isLoading,
    list,
    totalRow,
    totalPages,
    invalidate,
  }
}
