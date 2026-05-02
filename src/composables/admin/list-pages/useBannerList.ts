import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchAdminBannerList } from '@/api/event/banner'
import { fetchAdminCityList } from '@/api/event/city'
import type { BannerVO, CityVO } from '@/api/event'
import { queryKeys } from '@/constants'

const adminBannersQueryKey = queryKeys.admin.list('banners')
const adminCitiesQueryKey = queryKeys.admin.list('cities')

export function useBannerList(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchTitle: Ref<string>
  searchCityId: Ref<string>
  citiesData: Ref<CityVO[] | undefined>
  citiesMap: ComputedRef<Map<string, CityVO>>
  isLoading: Ref<boolean>
  list: ComputedRef<BannerVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  invalidate: () => Promise<void>
} {
  const queryClient = useQueryClient()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchTitle = ref('')
  const searchCityId = ref('')

  const { data: citiesData } = useQuery({
    queryKey: adminCitiesQueryKey,
    queryFn: fetchAdminCityList,
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
      fetchAdminBannerList({
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
