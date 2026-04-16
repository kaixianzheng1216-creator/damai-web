import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyTicketPage } from '@/api/ticket'
import { ORDER_PAGE_SIZE } from '@/constants'
import type { TicketVO } from '@/api/ticket'

export const useTicketList = () => {
  const ticketPage = ref(1)
  const ticketPageSize = ref(ORDER_PAGE_SIZE)

  const myTicketPageQuery = useQuery({
    queryKey: ['my-ticket-page', ticketPage, ticketPageSize],
    queryFn: () =>
      fetchMyTicketPage({
        page: ticketPage.value,
        size: ticketPageSize.value,
      }),
  })

  const ticketList = computed<TicketVO[]>(() => myTicketPageQuery.data.value?.records ?? [])
  const ticketTotalPages = computed(() => myTicketPageQuery.data.value?.totalPage ?? 1)
  const ticketTotalRow = computed(() => myTicketPageQuery.data.value?.totalRow ?? 0)

  const updateTicketPage = (page: number) => {
    if (page < 1) {
      return
    }

    ticketPage.value = page
  }

  const updateTicketPageSize = (pageSize: number) => {
    if (pageSize < 1) {
      return
    }

    ticketPageSize.value = pageSize
    ticketPage.value = 1
  }

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
