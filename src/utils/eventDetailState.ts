import dayjs, { type Dayjs } from 'dayjs'
import type { PassengerItem } from '@/api/account'
import type { EventDetailVO, NoticeItemVO, TicketTypeVO } from '@/api/event'
import { EVENT_CONFIG, TICKET_TYPE_STATUS, type DetailTabKey } from '@/constants'

export interface PassengerSlot {
  index: number
  label: string
  passengerId: string | null
}

export interface MaxTicketQuantityOptions {
  ticketType: TicketTypeVO | undefined
  userPurchasedCount: number
  availableQty?: number
  defaultLimit?: number
}

export const isTicketTypeOnSale = (ticketType: TicketTypeVO, now: Dayjs = dayjs()): boolean => {
  if (ticketType.status !== TICKET_TYPE_STATUS.ON_SALE) {
    return false
  }

  const saleStart = dayjs(ticketType.saleStartAt)
  const saleEnd = dayjs(ticketType.saleEndAt)

  return now.isAfter(saleStart) && now.isBefore(saleEnd)
}

export const resolveInitialSessionId = (detail: EventDetailVO | undefined) =>
  detail?.sessions[0]?.id ?? null

export const resolveSelectedTicketTypeId = (
  ticketTypes: TicketTypeVO[],
  currentTicketTypeId: string | null,
  now?: Dayjs,
) => {
  const currentTicketType = ticketTypes.find((item) => item.id === currentTicketTypeId)
  if (currentTicketType && isTicketTypeOnSale(currentTicketType, now)) {
    return currentTicketType.id
  }

  return ticketTypes.find((item) => isTicketTypeOnSale(item, now))?.id ?? null
}

export const buildPassengerSelection = (
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

export const getSelectedPassengers = (
  selectedPassengerIds: string[],
  passengers: PassengerItem[],
) =>
  selectedPassengerIds
    .map((id) => passengers.find((item) => item.id === id) ?? null)
    .filter((item): item is PassengerItem => item !== null)

export const buildPassengerSlots = (
  quantity: number,
  selectedPassengerIds: string[],
): PassengerSlot[] =>
  Array.from({ length: quantity }, (_, index) => ({
    index,
    label: `第 ${index + 1} 张票`,
    passengerId: selectedPassengerIds[index] ?? null,
  }))

export const getUserPurchasedCount = (
  ticketTypeId: string | null | undefined,
  purchaseCounts: Record<string, number> | undefined,
) => {
  if (!ticketTypeId || !purchaseCounts) {
    return 0
  }

  return purchaseCounts[ticketTypeId] ?? 0
}

export const calculateMaxTicketQuantity = ({
  ticketType,
  userPurchasedCount,
  availableQty,
  defaultLimit = EVENT_CONFIG.DEFAULT_ORDER_LIMIT,
}: MaxTicketQuantityOptions) => {
  const orderLimit = ticketType?.orderLimit ?? defaultLimit
  const inventory = ticketType?.inventory
  const inventoryAvailableQty = inventory
    ? inventory.totalQty - inventory.lockedQty - inventory.soldQty
    : orderLimit
  const resolvedAvailableQty = availableQty ?? inventoryAvailableQty
  const accountLimit = ticketType?.accountLimit ?? 0
  const userRemaining =
    accountLimit > 0 ? Math.max(0, accountLimit - userPurchasedCount) : orderLimit

  return Math.max(0, Math.min(orderLimit, resolvedAvailableQty, userRemaining))
}

export const getCurrentNotices = (
  detail: EventDetailVO | undefined,
  activeTab: DetailTabKey,
): NoticeItemVO[] => {
  if (!detail) {
    return []
  }

  if (activeTab === 'purchase') {
    return detail.info.purchaseNotice
  }

  if (activeTab === 'watch') {
    return detail.info.admissionNotice
  }

  return []
}
