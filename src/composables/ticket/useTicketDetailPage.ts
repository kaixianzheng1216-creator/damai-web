import { computed, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyTicketById, type TicketVO } from '@/api/ticket'
import { queryKeys, TICKET_STATUS } from '@/constants'

export const TICKET_DETAIL_STATUS_REFETCH_INTERVAL_MS = 5000

export function useTicketDetailPage(): {
  ticketId: ComputedRef<string>
  hasTicketId: ComputedRef<boolean>
  ticket: Ref<TicketVO | undefined>
  isLoading: Ref<boolean>
  isError: Ref<boolean>
  isEmpty: ComputedRef<boolean>
  goBack: () => void
} {
  const route = useRoute()
  const router = useRouter()

  const ticketId = computed(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) ?? ''
  })
  const hasTicketId = computed(() => ticketId.value.trim().length > 0)

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.ticket.detail(ticketId),
    queryFn: () => fetchMyTicketById(ticketId.value),
    enabled: hasTicketId,
    refetchInterval: (query) => {
      const currentStatus = (query.state.data as TicketVO | undefined)?.status
      return currentStatus === TICKET_STATUS.UNUSED
        ? TICKET_DETAIL_STATUS_REFETCH_INTERVAL_MS
        : false
    },
    refetchIntervalInBackground: false,
  })

  const isEmpty = computed(() => !hasTicketId.value)

  const goBack = () => {
    router.back()
  }

  return {
    ticketId,
    hasTicketId,
    ticket,
    isLoading,
    isError,
    isEmpty,
    goBack,
  }
}
