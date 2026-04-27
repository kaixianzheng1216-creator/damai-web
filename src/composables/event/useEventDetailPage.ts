import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { fetchPassengerPage } from '@/api/account'
import { fetchEventDetailById, followEvent, unfollowEvent, checkIsFollowedEvent } from '@/api/event'
import { createTicketOrder, fetchUserPurchaseCounts } from '@/api/trade'
import type { DetailTabKey } from '@/constants'
import { EVENT_CONFIG, TICKET_TYPE_STATUS, queryKeys } from '@/constants'
import type { PassengerItem, PageResponsePassengerVO } from '@/api/account'
import type { SessionVO, TicketTypeVO, SeriesEventVO } from '@/api/event'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'
import { mapPassengerToPassengerItem } from '@/utils/mappers'
import { useFollowToggle } from '@/composables/common/useFollowToggle'

const isTicketTypeOnSale = (ticketType: TicketTypeVO): boolean => {
  if (ticketType.status !== TICKET_TYPE_STATUS.ON_SALE) {
    return false
  }
  const now = dayjs()
  const saleStart = dayjs(ticketType.saleStartAt)
  const saleEnd = dayjs(ticketType.saleEndAt)
  return now.isAfter(saleStart) && now.isBefore(saleEnd)
}

interface PassengerSlot {
  index: number
  label: string
  passengerId: string | null
}

const buildPassengerSelection = (
  currentIds: string[],
  passengerList: PassengerItem[],
  quantity: number,
) => {
  const nextIds = [...new Set(currentIds)].slice(0, quantity)

  for (const passenger of passengerList) {
    if (nextIds.length >= quantity) {
      break
    }

    if (!nextIds.includes(passenger.id)) {
      nextIds.push(passenger.id)
    }
  }

  return nextIds
}

export const useEventDetailPage = () => {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()

  const activeTab = ref<DetailTabKey>('detail')
  const selectedSessionId = ref<string | null>(null)
  const selectedTicketTypeId = ref<string | null>(null)
  const ticketQuantity = ref(1)
  const selectedPassengerIds = ref<string[]>([])
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
  } = useFollowToggle({
    id: () => eventId.value,
    followQueryKeyPrefix: 'event-followed',
    entityQueryKeyPrefix: 'event-detail',
    checkIsFollowed: checkIsFollowedEvent,
    follow: followEvent,
    unfollow: unfollowEvent,
    buildFollowRequest: (id) => ({ eventId: id }),
  })

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
  const sessions = computed<SessionVO[]>(() => detailQuery.data.value?.sessions ?? [])
  const selectedSession = computed<SessionVO | null>(
    () => sessions.value.find((item) => item.id === selectedSessionId.value) ?? null,
  )
  const availableTicketTypes = computed<TicketTypeVO[]>(
    () => selectedSession.value?.ticketTypes ?? [],
  )
  const selectedTicketType = computed(() =>
    availableTicketTypes.value.find((item) => item.id === selectedTicketTypeId.value),
  )
  const selectedTicketTypeLimit = computed(
    () => selectedTicketType.value?.orderLimit ?? EVENT_CONFIG.DEFAULT_ORDER_LIMIT,
  )
  const selectedTicketTypeAccountLimit = computed(() => selectedTicketType.value?.accountLimit ?? 0)
  const isSelectedTicketTypeOnSale = computed(() =>
    selectedTicketType.value ? isTicketTypeOnSale(selectedTicketType.value) : false,
  )

  const ticketTypeIds = computed(() => availableTicketTypes.value.map((t) => t.id))

  const purchaseCountsQuery = useQuery({
    queryKey: computed(() => ['purchase-counts', ticketTypeIds.value]),
    queryFn: () => fetchUserPurchaseCounts(ticketTypeIds.value),
    enabled: computed(() => userStore.isLoggedIn && ticketTypeIds.value.length > 0),
  })

  const userPurchasedCount = computed(() => {
    if (!selectedTicketTypeId.value || !purchaseCountsQuery.data.value) return 0
    return purchaseCountsQuery.data.value[selectedTicketTypeId.value] ?? 0
  })

  const isUserAccountLimitReached = computed(() => {
    const limit = selectedTicketTypeAccountLimit.value
    return limit > 0 && userPurchasedCount.value >= limit
  })

  const maxTicketQuantity = computed(() => {
    const inventory = selectedTicketType.value?.inventory
    const availableQty = inventory
      ? inventory.totalQty - inventory.lockedQty - inventory.soldQty
      : selectedTicketTypeLimit.value
    const accountLimit = selectedTicketTypeAccountLimit.value
    const userRemaining =
      accountLimit > 0
        ? Math.max(0, accountLimit - userPurchasedCount.value)
        : selectedTicketTypeLimit.value
    return Math.max(1, Math.min(selectedTicketTypeLimit.value, availableQty, userRemaining))
  })
  const totalPrice = computed(() =>
    selectedTicketType.value
      ? formatPrice(
          (selectedTicketType.value.salePrice ?? selectedTicketType.value.price ?? 0) *
            ticketQuantity.value,
        )
      : '¥0.00',
  )
  const selectedPassengers = computed<PassengerItem[]>(() =>
    selectedPassengerIds.value
      .map((id) => passengers.value.find((item) => item.id === id) ?? null)
      .filter((item): item is PassengerItem => item !== null),
  )
  const passengerSlots = computed<PassengerSlot[]>(() =>
    Array.from({ length: ticketQuantity.value }, (_, index) => ({
      index,
      label: `第 ${index + 1} 张票`,
      passengerId: selectedPassengerIds.value[index] ?? null,
    })),
  )
  const duplicatePassengerSelected = computed(
    () => new Set(selectedPassengerIds.value).size !== selectedPassengerIds.value.length,
  )
  const insufficientPassengerCount = computed(() => passengers.value.length < ticketQuantity.value)
  const canSubmitOrder = computed(() => {
    if (!selectedTicketType.value) {
      return false
    }

    return selectedPassengers.value.length === ticketQuantity.value
  })
  const currentNotices = computed(() => {
    if (!detailQuery.data.value) {
      return []
    }

    if (activeTab.value === 'purchase') {
      return detailQuery.data.value.info.purchaseNotice
    }

    if (activeTab.value === 'watch') {
      return detailQuery.data.value.info.admissionNotice
    }

    return []
  })
  const seriesEvents = computed<SeriesEventVO[]>(() => detailQuery.data.value?.seriesEvents ?? [])

  watch(
    () => detailQuery.data.value,
    (detail) => {
      if (!detail) {
        return
      }

      ticketQuantity.value = 1
      selectedSessionId.value = detail.sessions[0]?.id ?? null
    },
    { immediate: true },
  )

  watch(
    availableTicketTypes,
    (ticketTypes) => {
      const currentTicketType = ticketTypes.find((item) => item.id === selectedTicketTypeId.value)
      if (currentTicketType && isTicketTypeOnSale(currentTicketType)) {
        return
      }

      selectedTicketTypeId.value = ticketTypes.find((item) => isTicketTypeOnSale(item))?.id ?? null
    },
    { immediate: true },
  )

  watch(
    passengers,
    (passengerList) => {
      if (!passengerList.length) {
        selectedPassengerIds.value = []
        return
      }

      const passengerIds = passengerList.map((item) => item.id)
      const filtered = selectedPassengerIds.value.filter((id) => passengerIds.includes(id))
      selectedPassengerIds.value = buildPassengerSelection(
        filtered,
        passengerList,
        ticketQuantity.value,
      )
    },
    { immediate: true },
  )

  watch(
    ticketQuantity,
    (value) => {
      selectedPassengerIds.value = buildPassengerSelection(
        selectedPassengerIds.value,
        passengers.value,
        value,
      )
    },
    { immediate: true },
  )

  watch(
    selectedTicketTypeLimit,
    (limit) => {
      if (ticketQuantity.value > limit) {
        ticketQuantity.value = limit
      }
    },
    { immediate: true },
  )

  const createOrderMutation = useMutation({
    mutationFn: createTicketOrder,
  })

  const updatePassengerForSlot = (index: number, passengerId: string | null) => {
    const next = [...selectedPassengerIds.value]
    if (passengerId) {
      next[index] = passengerId
    } else {
      next.splice(index, 1)
    }
    selectedPassengerIds.value = next
  }

  const passengerOptionDisabled = (passengerId: string, currentIndex: number) =>
    selectedPassengerIds.value.some(
      (selectedId, index) => index !== currentIndex && selectedId === passengerId,
    )

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

    if (!detailQuery.data.value || !selectedTicketType.value) {
      return
    }

    if (!selectedSession.value) {
      return
    }

    ticketQuantity.value = Math.min(ticketQuantity.value, maxTicketQuantity.value)
    showPassengerModal.value = true
  }

  const confirmPassengerAndCreateOrder = async () => {
    if (!detailQuery.data.value || !selectedTicketType.value || !canSubmitOrder.value) {
      return
    }

    if (!selectedSession.value) {
      return
    }

    const orderStatus = await createOrderMutation.mutateAsync({
      eventId: detailQuery.data.value.event.id,
      venueId: detailQuery.data.value.event.venueId,
      sessionId: selectedSession.value.id,
      ticketTypeId: selectedTicketType.value.id,
      passengerIds: selectedPassengerIds.value,
    })

    showPassengerModal.value = false
    await router.push(`/checkout/${orderStatus.orderId}`)
  }

  const updatePassengerKeyword = (keyword: string) => {
    passengerKeyword.value = keyword
  }

  return {
    activeTab,
    selectedSessionId,
    selectedTicketTypeId,
    ticketQuantity,
    selectedPassengerIds,
    showPassengerModal,
    detailQuery,
    passengerListQuery,
    passengers,
    passengerKeyword,
    selectedSession,
    availableTicketTypes,
    selectedTicketType,
    selectedTicketTypeLimit,
    selectedTicketTypeAccountLimit,
    isSelectedTicketTypeOnSale,
    isTicketTypeOnSale,
    isUserAccountLimitReached,
    maxTicketQuantity,
    totalPrice,
    passengerSlots,
    duplicatePassengerSelected,
    insufficientPassengerCount,
    canSubmitOrder,
    currentNotices,
    seriesEvents,
    createOrderMutation,
    updatePassengerForSlot,
    passengerOptionDisabled,
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
