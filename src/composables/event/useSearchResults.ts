import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchEventPage } from '@/api/event'
import { DEFAULT_SEARCH_QUERY, SORT_OPTIONS } from '@/constants/search'
import { queryKeys } from '@/constants'
import type { EventPageRequest } from '@/api/event'
import type { ComputedRef } from 'vue'

export const useSearchResults = (queryParams: ComputedRef<EventPageRequest>) => {
  const route = useRoute()
  const router = useRouter()

  const searchQuery = useQuery({
    queryKey: queryKeys.event.search(queryParams),
    queryFn: () => fetchEventPage(queryParams.value),
  })

  const searchRecords = computed(() => searchQuery.data.value?.records ?? [])
  const totalRow = computed(() => Number(searchQuery.data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(searchQuery.data.value?.totalPage) || 1)

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
    searchQuery,
    searchRecords,
    totalRow,
    totalPages,
    sortOptions,
    visiblePages,
    handleSortChange,
    handlePageChange,
  }
}
