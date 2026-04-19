import { useQuery } from '@tanstack/vue-query'
import { fetchMyTicketPage } from '@/api/ticket'
import { ORDER_PAGE_SIZE } from '@/constants'
import { usePagination } from '@/composables/common'
import type { TicketVO } from '@/api/ticket'

export const useTicketList = () => {
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
    queryKey: ['my-ticket-page', ticketPage, ticketPageSize],
    queryFn: () => fetchMyTicketPage(getPaginationParams()),
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
