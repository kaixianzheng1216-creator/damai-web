import { computed, watch, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchBanners, fetchCategories, fetchEventPage, fetchCitiesList } from '@/api/event'
import { convertCategoryVOToHomeItem, convertEventVOToCardItem } from '@/utils/mappers'
import type {
  HomeBannerItem,
  HomeCategoryItem,
  HomeEventCardItem,
  PageResponseEventVO,
  CityVO,
} from '@/api/event'
import { HOME_CONFIG, COMMON_CONFIG, queryKeys } from '@/constants'

interface HomeSectionViewModel {
  key: string
  title: string
  linkUrl: string
  events: HomeEventCardItem[]
}

interface EventQueryResult {
  data: PageResponseEventVO | undefined
  isLoading: boolean
  isError: boolean
}

export const useHomePage = () => {
  const queryClient = useQueryClient()
  const selectedCity = useStorage('selected-city', COMMON_CONFIG.DEFAULT_CITY)

  const bannersQuery = useQuery({
    queryKey: queryKeys.home.banners(),
    queryFn: () => fetchBanners(),
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.home.categories(),
    queryFn: fetchCategories,
  })

  const citiesQuery = useQuery({
    queryKey: queryKeys.home.cities(),
    queryFn: fetchCitiesList,
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

  const eventQueryResults = ref<Map<string, EventQueryResult>>(new Map())
  const eventQueriesLoading = ref<Set<string>>(new Set())

  const fetchCategoryEvents = async (categoryId: string) => {
    if (eventQueriesLoading.value.has(categoryId)) {
      return
    }

    eventQueriesLoading.value.add(categoryId)

    try {
      const data = await fetchEventPage({
        page: 1,
        size: HOME_CONFIG.EVENT_PAGE_SIZE,
        categoryId,
        cityId: selectedCityId.value,
        sortField: 'recommendWeight',
        sortOrder: 'desc',
      })

      eventQueryResults.value.set(categoryId, {
        data,
        isLoading: false,
        isError: false,
      })
    } catch {
      eventQueryResults.value.set(categoryId, {
        data: undefined,
        isLoading: false,
        isError: true,
      })
    } finally {
      eventQueriesLoading.value.delete(categoryId)
    }
  }

  watch(
    [topCategories, citiesQuery.data],
    ([newTopCategories]) => {
      if (!newTopCategories || !citiesQuery.data.value) {
        return
      }
      newTopCategories.forEach((category) => {
        if (!eventQueryResults.value.has(category.id)) {
          fetchCategoryEvents(category.id)
        }
      })
    },
    { immediate: true },
  )

  const eventSections = computed<HomeSectionViewModel[]>(() => {
    return topCategories.value.map((category) => {
      const queryResult = eventQueryResults.value.get(category.id)
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
      eventQueriesLoading.value.size > 0 ||
      Array.from(eventQueryResults.value.values()).some((r) => r.isLoading),
  )

  const isError = computed(
    () =>
      bannersQuery.isError.value ||
      categoriesQuery.isError.value ||
      Array.from(eventQueryResults.value.values()).some((r) => r.isError),
  )

  watch(selectedCity, async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.home.banners() })
    eventQueryResults.value.clear()
    topCategories.value.forEach((category) => {
      fetchCategoryEvents(category.id)
    })
  })

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
