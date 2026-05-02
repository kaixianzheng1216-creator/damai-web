import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchCitiesList, fetchCategories } from '@/api/event'
import { DEFAULT_SEARCH_QUERY, TIME_OPTIONS } from '@/constants/search'
import { queryKeys } from '@/constants'
import type { EventPageRequest, CityVO, CategoryVO } from '@/api/event'
import dayjs from 'dayjs'

type FilterField = 'cityId' | 'categoryId' | 'timeType' | 'date'

const parseQueryNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

const parseQueryString = (value: unknown) => {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

const findParentCategoryId = (categories: CategoryVO[], categoryId: string) => {
  for (const category of categories) {
    if (category.id === categoryId)
      return category.parentId === '0' ? category.id : category.parentId
    if (category.children?.some((child) => child.id === categoryId)) return category.id
  }
  return undefined
}

export const useSearchFilters = () => {
  const route = useRoute()
  const router = useRouter()

  const citiesQuery = useQuery({
    queryKey: queryKeys.event.searchCities(),
    queryFn: fetchCitiesList,
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.event.searchCategories(),
    queryFn: fetchCategories,
  })

  const selectedParentCategoryId = ref<string | undefined>()

  const queryParams = computed<EventPageRequest>(() => ({
    name:
      typeof route.query.keyword === 'string' ? route.query.keyword : DEFAULT_SEARCH_QUERY.keyword,
    cityId: parseQueryString(route.query.cityId),
    categoryId: parseQueryString(route.query.categoryId),
    timeType:
      typeof route.query.timeType === 'string'
        ? parseQueryNumber(route.query.timeType, DEFAULT_SEARCH_QUERY.timeType)
        : DEFAULT_SEARCH_QUERY.timeType,
    date: parseQueryString(route.query.date),
    sortType:
      typeof route.query.sortType === 'string'
        ? parseQueryNumber(route.query.sortType, DEFAULT_SEARCH_QUERY.sortType)
        : DEFAULT_SEARCH_QUERY.sortType,
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

  const cityOptions = computed(() => {
    const cities = citiesQuery.data.value ?? []
    return [
      { label: '全部', value: undefined },
      ...cities.map((city: CityVO) => ({ label: city.name, value: city.id })),
    ]
  })

  const parentCategoryOptions = computed(() => {
    const categories = categoriesQuery.data.value ?? []
    const options: { label: string; value: string | undefined }[] = [
      { label: '全部', value: undefined },
    ]
    categories.forEach((cat) => {
      if (cat.parentId === '0') options.push({ label: cat.name, value: cat.id })
    })
    return options
  })

  const childCategoryOptions = computed(() => {
    const categories = categoriesQuery.data.value ?? []
    if (!selectedParentCategoryId.value) return []
    const options: { label: string; value: string | undefined }[] = [
      { label: '全部', value: selectedParentCategoryId.value },
    ]
    const parent = categories.find((cat) => cat.id === selectedParentCategoryId.value)
    parent?.children?.forEach((child: CategoryVO) =>
      options.push({ label: child.name, value: child.id }),
    )
    return options
  })

  const syncCategoryFromUrl = () => {
    const categoryId = queryParams.value.categoryId
    if (!categoryId) {
      selectedParentCategoryId.value = undefined
      return
    }
    selectedParentCategoryId.value = findParentCategoryId(
      categoriesQuery.data.value ?? [],
      categoryId,
    )
  }

  watch([categoriesQuery.data, () => route.query.categoryId], syncCategoryFromUrl, {
    immediate: true,
  })

  const timeOptions = computed(() => TIME_OPTIONS)

  const pushQuery = async (query: Record<string, string | undefined>) => {
    await router.push({ name: 'category', query: { ...route.query, ...query } })
  }

  const handleFilterChange = async (field: FilterField, value: string | number | undefined) => {
    const updates: Record<string, string | undefined> = {
      [field]: value?.toString(),
      page: String(DEFAULT_SEARCH_QUERY.page),
    }
    if (field === 'timeType' && value !== 4) updates.date = undefined
    if (field === 'timeType' && value === 4 && !route.query.date)
      updates.date = dayjs().format('YYYY-MM-DD')
    await pushQuery(updates)
  }

  const handleParentCategoryChange = async (value: string | number | undefined) => {
    selectedParentCategoryId.value = typeof value === 'string' ? value : undefined
    await handleFilterChange('categoryId', value)
  }

  const handleCalendarDateChange = async (date: string) => {
    await pushQuery({ timeType: '4', date, page: String(DEFAULT_SEARCH_QUERY.page) })
  }

  return {
    queryParams,
    cityOptions,
    parentCategoryOptions,
    childCategoryOptions,
    selectedParentCategoryId,
    timeOptions,
    handleFilterChange,
    handleParentCategoryChange,
    handleCalendarDateChange,
  }
}
