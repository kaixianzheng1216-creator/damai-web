import { computed } from 'vue'
import { useQuery, useQueries } from '@tanstack/vue-query'
import { fetchBannerList, fetchCategoryList, fetchEventPage, fetchCityList } from '@/api/event'
import { convertCategoryVOToHomeItem, convertEventVOToCardItem } from '@/utils/mappers'
import type { HomeBannerItem, HomeCategoryItem, HomeEventCardItem, CityVO } from '@/api/event'
import { HOME_CONFIG, COMMON_CONFIG, queryKeys } from '@/constants'

interface HomeSectionViewModel {
  key: string
  title: string
  linkUrl: string
  events: HomeEventCardItem[]
}

export const useHomePage = () => {
  const selectedCity = useStorage('selected-city', COMMON_CONFIG.DEFAULT_CITY)

  const categoriesQuery = useQuery({
    queryKey: queryKeys.home.categories(),
    queryFn: fetchCategoryList,
  })

  const citiesQuery = useQuery({
    queryKey: queryKeys.home.cities(),
    queryFn: fetchCityList,
  })

  const categories = computed<HomeCategoryItem[]>(() => {
    return (categoriesQuery.data.value ?? [])
      .map(convertCategoryVOToHomeItem)
      .slice(0, HOME_CONFIG.CATEGORY_LIMIT)
  })

  const topCategories = computed(() => categories.value.slice(0, HOME_CONFIG.TOP_CATEGORY_LIMIT))

  const cityIdMap = computed<Map<string, string>>(() => {
    const map = new Map<string, string>()
    citiesQuery.data.value?.forEach((city: CityVO) => {
      map.set(city.name, city.id)
    })
    return map
  })

  const selectedCityId = computed<string | undefined>(() => {
    return cityIdMap.value.get(selectedCity.value)
  })

  const bannersQuery = useQuery({
    queryKey: computed(() => queryKeys.home.banners(selectedCityId.value)),
    queryFn: () => {
      const cityId = selectedCityId.value
      if (!cityId) return Promise.resolve([])
      return fetchBannerList(cityId)
    },
    enabled: computed(() => Boolean(selectedCityId.value)),
  })

  const categoriesData = computed(() => categoriesQuery.data.value ?? [])

  const categoryEventQueries = useQueries({
    queries: computed(() =>
      categoriesData.value.map((cat) => ({
        queryKey: queryKeys.home.categoryEvents(cat.id, cat.name, selectedCityId.value),
        queryFn: () =>
          fetchEventPage({
            page: 1,
            size: HOME_CONFIG.EVENT_PAGE_SIZE,
            categoryId: cat.id,
            cityId: selectedCityId.value,
            sortField: 'recommendWeight',
            sortOrder: 'desc',
          }),
      })),
    ),
  })

  const eventSections = computed<HomeSectionViewModel[]>(() => {
    return topCategories.value.map((category) => {
      const idx = categoriesData.value.findIndex((cat) => cat.id === category.id)
      const queryResult = idx >= 0 ? categoryEventQueries.value[idx] : undefined
      const events = (queryResult?.data?.records ?? []).map(convertEventVOToCardItem)

      return {
        key: `category-${category.id}`,
        title: category.name,
        linkUrl: `/category?categoryId=${category.id}`,
        events,
      }
    })
  })

  const isLoading = computed(
    () =>
      bannersQuery.isLoading.value ||
      categoriesQuery.isLoading.value ||
      citiesQuery.isLoading.value ||
      categoryEventQueries.value.some((q) => q.isLoading),
  )

  const isError = computed(
    () =>
      bannersQuery.isError.value ||
      categoriesQuery.isError.value ||
      citiesQuery.isError.value ||
      categoryEventQueries.value.some((q) => q.isError),
  )

  return {
    selectedCity,
    bannersQuery,
    categoriesQuery,
    banners: computed<HomeBannerItem[]>(() => bannersQuery.data.value ?? []),
    categories,
    eventSections,
    isLoading,
    isError,
  }
}
