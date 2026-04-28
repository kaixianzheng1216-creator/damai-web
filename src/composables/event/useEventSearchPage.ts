import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { fetchEventPage, fetchCitiesList, fetchCategories } from '@/api/event'
import { DEFAULT_SEARCH_QUERY, TIME_OPTIONS, SORT_OPTIONS } from '@/constants/search'
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
    if (category.id === categoryId) {
      return category.parentId === '0' ? category.id : category.parentId
    }

    if (category.children?.some((child) => child.id === categoryId)) {
      return category.id
    }
  }

  return undefined
}

export const useEventSearchPage = () => {
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

  // 选中的一级分类
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

  const searchQuery = useQuery({
    queryKey: queryKeys.event.search(queryParams),
    queryFn: () => fetchEventPage(queryParams.value),
  })

  const searchRecords = computed(() => searchQuery.data.value?.records ?? [])
  const totalRow = computed(() => Number(searchQuery.data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(searchQuery.data.value?.totalPage) || 1)

  const cityOptions = computed(() => {
    const cities = citiesQuery.data.value ?? []
    return [
      { label: '全部', value: undefined },
      ...cities.map((city: CityVO) => ({ label: city.name, value: city.id })),
    ]
  })

  // 一级分类选项
  const parentCategoryOptions = computed(() => {
    const categories = categoriesQuery.data.value ?? []
    const options: { label: string; value: string | undefined }[] = [
      { label: '全部', value: undefined },
    ]

    categories.forEach((cat) => {
      if (cat.parentId === '0') {
        options.push({ label: cat.name, value: cat.id })
      }
    })

    return options
  })

  // 二级分类选项（基于选中的一级分类）
  const childCategoryOptions = computed(() => {
    const categories = categoriesQuery.data.value ?? []
    const options: { label: string; value: string | undefined }[] = []

    if (!selectedParentCategoryId.value) {
      return options
    }

    // 第一个选项是"全部"，值为一级分类ID（查该一级分类下所有子分类）
    options.push({ label: '全部', value: selectedParentCategoryId.value })

    const parentCategory = categories.find((cat) => cat.id === selectedParentCategoryId.value)

    if (parentCategory?.children && parentCategory.children.length > 0) {
      parentCategory.children.forEach((child: CategoryVO) => {
        options.push({ label: child.name, value: child.id })
      })
    }

    return options
  })

  // 同步 URL 中的 categoryId 到 selectedParentCategoryId
  const syncCategoryFromUrl = () => {
    const categoryId = queryParams.value.categoryId
    if (!categoryId) {
      selectedParentCategoryId.value = undefined
      return
    }

    const categories = categoriesQuery.data.value ?? []
    selectedParentCategoryId.value = findParentCategoryId(categories, categoryId)
  }

  // 当分类数据加载完成或 URL 变化时同步
  watch([categoriesQuery.data, () => route.query.categoryId], syncCategoryFromUrl, {
    immediate: true,
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

  const handleFilterChange = async (field: FilterField, value: string | number | undefined) => {
    const updates: Record<string, string | undefined> = {
      [field]: value?.toString(),
      page: String(DEFAULT_SEARCH_QUERY.page),
    }

    // 当时间筛选切换到非"按日历"时，清除 date 参数
    if (field === 'timeType' && value !== 4) {
      updates.date = undefined
    }

    // 当时间筛选切换到"按日历"且没有 date 时，默认设为今天
    if (field === 'timeType' && value === 4 && !route.query.date) {
      updates.date = dayjs().format('YYYY-MM-DD')
    }

    await pushQuery(updates)
  }

  const handleParentCategoryChange = async (value: string | number | undefined) => {
    selectedParentCategoryId.value = typeof value === 'string' ? value : undefined
    await handleFilterChange('categoryId', value)
  }

  const handleCalendarDateChange = async (date: string) => {
    await pushQuery({
      timeType: '4',
      date,
      page: String(DEFAULT_SEARCH_QUERY.page),
    })
  }

  const handleSortChange = async (sortType: number) => {
    const sortMap = {
      0: { field: 'recommendWeight', order: 'desc' },
      1: { field: 'firstSessionStartAt', order: 'asc' },
      2: { field: 'createdAt', order: 'desc' },
    } as const
    const preset = sortMap[sortType as keyof typeof sortMap] ?? sortMap[0]

    await pushQuery({
      sortType: String(sortType),
      sortField: preset.field,
      sortOrder: preset.order,
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
    searchRecords,
    totalRow,
    totalPages,
    sortOptions,
    cityOptions,
    parentCategoryOptions,
    childCategoryOptions,
    selectedParentCategoryId,
    timeOptions,
    visiblePages,
    handleFilterChange,
    handleParentCategoryChange,
    handleCalendarDateChange,
    handleSortChange,
    handlePageChange,
  }
}
