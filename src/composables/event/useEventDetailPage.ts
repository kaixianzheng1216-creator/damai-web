import { computed, ref } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { fetchPassengerPage } from '@/api/account'
import { fetchEventDetailById } from '@/api/event'
import { createTicketOrder, fetchMyPurchaseCounts } from '@/api/trade'
import { queryKeys } from '@/constants'
import type { PassengerItem, PageResponsePassengerVO } from '@/api/account'
import { useUserStore } from '@/stores/user'
import { mapPassengerToPassengerItem } from '@/utils/mappers'
import { calculateMaxTicketQuantity, getUserPurchasedCount } from '@/utils/eventDetailState'
import { useEventFollow } from './useEventFollow'
import { useEventTicketSelection } from './useEventTicketSelection'

export const useEventDetailPage = () => {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()

  const showPassengerModal = ref(false)
  const passengerKeyword = ref('')

  const eventId = computed(() => route.params.id as string)

  const detailQuery = useQuery({
    queryKey: queryKeys.event.detail(eventId),
    queryFn: () => fetchEventDetailById(eventId.value),
    enabled: computed(() => !!eventId.value && eventId.value.length > 0),
  })

  const {
    isFollowedQuery,
    followMutation,
    unfollowMutation,
    toggleFollow,
    isFollowed,
    isFollowLoading,
  } = useEventFollow(() => eventId.value)

  const passengerListQuery = useQuery<PageResponsePassengerVO>({
    queryKey: queryKeys.profile.passengers(1, 100, passengerKeyword),
    queryFn: () =>
      fetchPassengerPage({
        page: 1,
        size: 100,
        name: passengerKeyword.value || undefined,
      }),
    enabled: computed(() => userStore.isLoggedIn),
  })

  const passengers = computed<PassengerItem[]>(() => {
    return passengerListQuery.data.value?.records?.map(mapPassengerToPassengerItem) ?? []
  })
  const ticketSelection = useEventTicketSelection({
    detail: detailQuery.data,
    passengers,
  })

  const purchaseCountsQuery = useQuery({
    queryKey: queryKeys.trade.purchaseCounts(ticketSelection.ticketTypeIds),
    queryFn: () => fetchMyPurchaseCounts(ticketSelection.ticketTypeIds.value),
    enabled: computed(() => userStore.isLoggedIn && ticketSelection.ticketTypeIds.value.length > 0),
  })

  const userPurchasedCount = computed(() =>
    getUserPurchasedCount(
      ticketSelection.selectedTicketTypeId.value,
      purchaseCountsQuery.data.value,
    ),
  )

  const isUserAccountLimitReached = computed(() => {
    const limit = ticketSelection.selectedTicketTypeAccountLimit.value
    return limit > 0 && userPurchasedCount.value >= limit
  })

  const maxTicketQuantity = computed(() =>
    calculateMaxTicketQuantity({
      ticketType: ticketSelection.selectedTicketType.value,
      userPurchasedCount: userPurchasedCount.value,
    }),
  )

  const createOrderMutation = useMutation({
    mutationFn: createTicketOrder,
  })

  const switchEvent = async (targetId: string) => {
    if (targetId === eventId.value) {
      return
    }

    await router.push(`/detail/${targetId}`)
  }

  const handleBuyNow = async () => {
    if (!userStore.isLoggedIn) {
      await router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }

    if (!detailQuery.data.value || !ticketSelection.selectedTicketType.value) {
      return
    }

    if (!ticketSelection.selectedSession.value) {
      return
    }

    ticketSelection.ticketQuantity.value = Math.min(
      ticketSelection.ticketQuantity.value,
      maxTicketQuantity.value,
    )
    showPassengerModal.value = true
  }

  const confirmPassengerAndCreateOrder = async () => {
    if (
      !detailQuery.data.value ||
      !ticketSelection.selectedTicketType.value ||
      !ticketSelection.canSubmitOrder.value
    ) {
      return
    }

    if (!ticketSelection.selectedSession.value) {
      return
    }

    const orderStatus = await createOrderMutation.mutateAsync({
      eventId: detailQuery.data.value.event.id,
      venueId: detailQuery.data.value.event.venueId,
      sessionId: ticketSelection.selectedSession.value.id,
      ticketTypeId: ticketSelection.selectedTicketType.value.id,
      passengerIds: ticketSelection.selectedPassengerIds.value,
    })

    showPassengerModal.value = false
    await router.push(`/checkout/${orderStatus.orderId}`)
  }

  const updatePassengerKeyword = (keyword: string) => {
    passengerKeyword.value = keyword
  }

  return {
    ...ticketSelection,
    showPassengerModal,
    detailQuery,
    passengerListQuery,
    passengers,
    passengerKeyword,
    isUserAccountLimitReached,
    maxTicketQuantity,
    createOrderMutation,
    updatePassengerKeyword,
    switchEvent,
    handleBuyNow,
    confirmPassengerAndCreateOrder,
    // Follow
    isFollowedQuery,
    followMutation,
    unfollowMutation,
    toggleFollow,
    isFollowed,
    isFollowLoading,
  }
}
