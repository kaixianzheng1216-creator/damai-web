// ─── TicketType ──────────────────────────────────────────

export interface TicketInventoryVO {
  ticketTypeId: string
  totalQty: number
  lockedQty: number
  soldQty: number
}

export interface TicketAvailabilityVO {
  ticketTypeId: string
  availableQty: number
}

export interface TicketTypeVO {
  id: string
  eventId?: string
  sessionId: string
  name: string
  salePrice?: number
  orderLimit: number
  accountLimit: number
  status: number
  statusLabel: string
  saleStartAt: string
  saleEndAt: string
  inventory?: TicketInventoryVO
}

export interface TicketTypeCreateRequest {
  name: string
  salePrice: number
  orderLimit?: number
  accountLimit?: number
  saleStartAt?: string
  saleEndAt?: string
  totalQty: number
}

export interface TicketTypeUpdateRequest {
  name?: string
  salePrice?: number
  orderLimit?: number
  accountLimit?: number
  status?: number
  saleStartAt?: string
  saleEndAt?: string
}

export interface TicketTypeInventoryAdjustRequest {
  adjustQty: number
}

export interface TicketTypeCopyRequest {
  sourceSessionId: string
  targetSessionIds: string[]
}
