import { computed, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyTicketById, type TicketVO } from '@/api/ticket'
import { queryKeys } from '@/constants'

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
