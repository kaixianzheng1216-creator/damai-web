import { useQuery } from '@tanstack/vue-query'
import { fetchMyTicketPage } from '@/api/ticket'
import { ORDER_PAGE_SIZE, queryKeys } from '@/constants'
import { usePagination, useQueryEnabled, type QueryEnabledOptions } from '@/composables/common'
import type { TicketVO } from '@/api/ticket'

export const useTicketList = (options: QueryEnabledOptions = {}) => {
  const enabled = useQueryEnabled(options.enabled)
  const {
    page: ticketPage,
    pageSize: ticketPageSize,
    updatePage: updateTicketPage,
    updatePageSize: updateTicketPageSize,
    getPaginationParams,
    getRecords,
    getTotalPages,
    getTotalRow,
  } = usePagination({ initialPageSize: ORDER_PAGE_SIZE })

  const myTicketPageQuery = useQuery({
    queryKey: queryKeys.profile.tickets(ticketPage, ticketPageSize),
    queryFn: () => fetchMyTicketPage(getPaginationParams()),
    enabled,
  })

  const ticketList = getRecords<TicketVO>(myTicketPageQuery.data)
  const ticketTotalPages = getTotalPages(myTicketPageQuery.data)
  const ticketTotalRow = getTotalRow(myTicketPageQuery.data)

  return {
    ticketPage,
    ticketPageSize,
    myTicketPageQuery,
    ticketList,
    ticketTotalPages,
    ticketTotalRow,
    updateTicketPage,
    updateTicketPageSize,
  }
}
