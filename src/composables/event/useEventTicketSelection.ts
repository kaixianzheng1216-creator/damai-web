import { computed, ref, watch, type Ref } from 'vue'
import type { PassengerItem } from '@/api/account'
import type { EventDetailVO, SeriesEventVO, SessionVO, TicketTypeVO } from '@/api/event'
import type { DetailTabKey } from '@/constants'
import { EVENT_CONFIG } from '@/constants'
import { formatPrice } from '@/utils/format'
import {
  buildPassengerSelection,
  buildPassengerSlots,
  getCurrentNotices,
  getSelectedPassengers,
  isTicketTypeOnSale,
  resolveInitialSessionId,
  resolveSelectedTicketTypeId,
} from './eventDetailState'

interface UseEventTicketSelectionOptions {
  detail: Ref<EventDetailVO | undefined>
  passengers: Ref<PassengerItem[]>
}

export const useEventTicketSelection = ({ detail, passengers }: UseEventTicketSelectionOptions) => {
  const activeTab = ref<DetailTabKey>('detail')
  const selectedSessionId = ref<string | null>(null)
  const selectedTicketTypeId = ref<string | null>(null)
  const ticketQuantity = ref(1)
  const selectedPassengerIds = ref<string[]>([])

  const sessions = computed<SessionVO[]>(() => detail.value?.sessions ?? [])
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
  const ticketTypeIds = computed(() => availableTicketTypes.value.map((item) => item.id))
  const totalPrice = computed(() =>
    selectedTicketType.value
      ? formatPrice((selectedTicketType.value.salePrice ?? 0) * ticketQuantity.value)
      : '¥0.00',
  )
  const selectedPassengers = computed<PassengerItem[]>(() =>
    getSelectedPassengers(selectedPassengerIds.value, passengers.value),
  )
  const passengerSlots = computed(() =>
    buildPassengerSlots(ticketQuantity.value, selectedPassengerIds.value),
  )
  const duplicatePassengerSelected = computed(
    () => new Set(selectedPassengerIds.value).size !== selectedPassengerIds.value.length,
  )
  const insufficientPassengerCount = computed(() => passengers.value.length < ticketQuantity.value)
  const canSubmitOrder = computed(
    () => !!selectedTicketType.value && selectedPassengers.value.length === ticketQuantity.value,
  )
  const currentNotices = computed(() => getCurrentNotices(detail.value, activeTab.value))
  const seriesEvents = computed<SeriesEventVO[]>(() => detail.value?.seriesEvents ?? [])

  watch(
    detail,
    (nextDetail) => {
      if (!nextDetail) {
        return
      }

      ticketQuantity.value = 1
      selectedSessionId.value = resolveInitialSessionId(nextDetail)
    },
    { immediate: true },
  )

  watch(
    availableTicketTypes,
    (ticketTypes) => {
      selectedTicketTypeId.value = resolveSelectedTicketTypeId(
        ticketTypes,
        selectedTicketTypeId.value,
      )
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

  return {
    activeTab,
    selectedSessionId,
    selectedTicketTypeId,
    ticketQuantity,
    selectedPassengerIds,
    sessions,
    selectedSession,
    availableTicketTypes,
    selectedTicketType,
    selectedTicketTypeLimit,
    selectedTicketTypeAccountLimit,
    isSelectedTicketTypeOnSale,
    isTicketTypeOnSale,
    ticketTypeIds,
    totalPrice,
    selectedPassengers,
    passengerSlots,
    duplicatePassengerSelected,
    insufficientPassengerCount,
    canSubmitOrder,
    currentNotices,
    seriesEvents,
    updatePassengerForSlot,
    passengerOptionDisabled,
  }
}
