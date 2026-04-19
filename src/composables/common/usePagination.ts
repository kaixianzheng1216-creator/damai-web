import { computed, ref, watch, type Ref, type WatchSource } from 'vue'
import type { PaginatedResponse } from '@/api/types'

export interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  resetTriggers?: WatchSource[]
}

export function usePagination(options: PaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, resetTriggers = [] } = options

  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)

  const updatePage = (newPage: number) => {
    if (newPage < 1) return
    page.value = newPage
  }

  const updatePageSize = (newPageSize: number) => {
    if (newPageSize < 1) return
    pageSize.value = newPageSize
    page.value = 1
  }

  const resetPage = () => {
    page.value = 1
  }

  // 监听重置触发器
  if (resetTriggers.length > 0) {
    watch(resetTriggers, () => {
      resetPage()
    })
  }

  const getPaginationParams = () => ({
    page: page.value,
    size: pageSize.value,
  })

  // Helper functions to get computed values from query data
  const getRecords = <T>(data: Ref<PaginatedResponse<T> | undefined>) =>
    computed(() => data.value?.records ?? [])

  const getTotalPages = (data: Ref<PaginatedResponse<unknown> | undefined>) =>
    computed(() => data.value?.totalPage ?? 1)

  const getTotalRow = (data: Ref<PaginatedResponse<unknown> | undefined>) =>
    computed(() => data.value?.totalRow ?? 0)

  return {
    page,
    pageSize,
    updatePage,
    updatePageSize,
    resetPage,
    getPaginationParams,
    getRecords,
    getTotalPages,
    getTotalRow,
  }
}
