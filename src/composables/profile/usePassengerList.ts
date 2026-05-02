import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchPassengerPage } from '@/api/account'
import { mapPassengerToPassengerItem } from '@/utils/mappers'
import { queryKeys } from '@/constants'
import { usePagination, useQueryEnabled, type QueryEnabledOptions } from '@/composables/common'
import type { PassengerItem, PageResponsePassengerVO } from '@/api/account'

export const usePassengerList = (options: QueryEnabledOptions = {}) => {
  const enabled = useQueryEnabled(options.enabled)
  const queryClient = useQueryClient()

  const passengerKeyword = ref('')

  const {
    page: passengerPage,
    pageSize: passengerPageSize,
    updatePage: updatePassengerPage,
    updatePageSize: updatePassengerPageSize,
    getPaginationParams,
    getRecords,
    getTotalPages,
    getTotalRow,
  } = usePagination({
    initialPageSize: 10,
    resetTriggers: [passengerKeyword],
  })

  const passengerListQuery = useQuery<PageResponsePassengerVO>({
    queryKey: queryKeys.profile.passengers(passengerPage, passengerPageSize, passengerKeyword),
    queryFn: () =>
      fetchPassengerPage({
        ...getPaginationParams(),
        name: passengerKeyword.value || undefined,
      }),
    enabled,
  })

  const passengerList = computed<PassengerItem[]>(() => {
    return getRecords(passengerListQuery.data).value.map(mapPassengerToPassengerItem) ?? []
  })

  const passengerTotalPages = getTotalPages(passengerListQuery.data)
  const passengerTotalRow = getTotalRow(passengerListQuery.data)

  const refreshPassengerList = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.passengers() })

  const updatePassengerKeyword = (keyword: string) => {
    passengerKeyword.value = keyword
  }

  return {
    passengerListQuery,
    passengerList,
    passengerPage,
    passengerPageSize,
    passengerTotalPages,
    passengerTotalRow,
    passengerKeyword,
    updatePassengerPage,
    updatePassengerPageSize,
    updatePassengerKeyword,
    refreshPassengerList,
  }
}
