import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { fetchEventPage, fetchCitiesList, fetchCategories } from '@/api/event'
import { DEFAULT_SEARCH_QUERY, TIME_OPTIONS, SORT_OPTIONS } from '@/constants/search'
import type { EventPageRequest, CityVO, CategoryVO } from '@/api/event'

const parseQueryNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseQueryString = (value: unknown) => {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export const useEventSearchPage = () => {
  const route = useRoute()
  const router = useRouter()

  const citiesQuery = useQuery({
    queryKey: ['search-cities'],
    queryFn: fetchCitiesList,
  })

  const categoriesQuery = useQuery({
    queryKey: ['search-categories'],
    queryFn: fetchCategories,
  })

  const queryParams = computed<EventPageRequest>(() => ({
    name:
      typeof route.query.keyword === 'string' ? route.query.keyword : DEFAULT_SEARCH_QUERY.keyword,
    cityId: parseQueryString(route.query.cityId),
    categoryId: parseQueryString(route.query.categoryId),
    timeType:
      typeof route.query.timeType === 'string'
        ? parseQueryNumber(route.query.timeType, DEFAULT_SEARCH_QUERY.timeType)
        : DEFAULT_SEARCH_QUERY.timeType,
    sortField:
      typeof route.query.sortField === 'string'
        ? route.query.sortField
        : DEFAULT_SEARCH_QUERY.sortField,
    sortOrder:
      typeof route.query.sortOrder === 'string'
        ? route.query.sortOrder
        : DEFAULT_SEARCH_QUERY.sortOrder,
    page:
      typeof route.query.page === 'string'
        ? parseQueryNumber(route.query.page, DEFAULT_SEARCH_QUERY.page)
        : DEFAULT_SEARCH_QUERY.page,
    size:
      typeof route.query.size === 'string'
        ? parseQueryNumber(route.query.size, DEFAULT_SEARCH_QUERY.size)
        : DEFAULT_SEARCH_QUERY.size,
  }))

  const searchQuery = useQuery({
    queryKey: ['event-search', queryParams],
    queryFn: () => fetchEventPage(queryParams.value),
  })

  const totalPages = computed(() => Number(searchQuery.data.value?.totalPage) || 1)

  const cityOptions = computed(() => {
    const cities = citiesQuery.data.value ?? []
    return [
      { label: '全部', value: undefined },
      ...cities.map((city: CityVO) => ({ label: city.name, value: city.id })),
    ]
  })

  const categoryOptions = computed(() => {
    const categories = categoriesQuery.data.value ?? []
    return [
      { label: '全部', value: undefined },
      ...categories.map((category: CategoryVO) => ({ label: category.name, value: category.id })),
    ]
  })

  const timeOptions = computed(() => TIME_OPTIONS)

  const sortOptions = computed(() => SORT_OPTIONS)

  const visiblePages = computed(() => {
    const currentPage = queryParams.value.page ?? 1
    const pages = new Set<number>([1, totalPages.value])

    for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
      if (page >= 1 && page <= totalPages.value) {
        pages.add(page)
      }
    }

    return [...pages].sort((a, b) => a - b)
  })

  const pushQuery = async (query: Record<string, string | undefined>) => {
    await router.push({
      name: 'category',
      query: {
        ...route.query,
        ...query,
      },
    })
  }

  const handleFilterChange = async (
    field: 'cityId' | 'categoryId' | 'timeType',
    value: string | number | undefined,
  ) => {
    await pushQuery({
      [field]: value?.toString(),
      page: String(DEFAULT_SEARCH_QUERY.page),
    })
  }

  const handleSortChange = async (sortOption: { field: string; order: string }) => {
    await pushQuery({
      sortField: sortOption.field,
      sortOrder: sortOption.order,
      page: String(DEFAULT_SEARCH_QUERY.page),
    })
  }

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages.value) {
      return
    }

    await pushQuery({ page: String(page) })
  }

  return {
    queryParams,
    searchQuery,
    totalPages,
    sortOptions,
    cityOptions,
    categoryOptions,
    timeOptions,
    visiblePages,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
  }
}
