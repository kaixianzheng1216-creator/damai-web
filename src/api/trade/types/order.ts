import type { PaginatedResponse } from '@/api/types'

// ─── VO ──────────────────────────────────────────────────

export interface TicketOrderVO {
  id: string
  orderNo?: string
  userId?: string
  unitPrice?: number
  quantity?: number
  totalAmount?: number
  eventId?: string
  eventNameSnapshot?: string
  eventCoverUrlSnapshot?: string
  venueId?: string
  venueNameSnapshot?: string
  venueAddressSnapshot?: string
  sessionId?: string
  sessionNameSnapshot?: string
  sessionStartAtSnapshot?: string
  ticketTypeId?: string
  ticketTypeNameSnapshot?: string
  passengerIds?: string[]
  status: number
  statusLabel: string
  payTime?: string | null
  cancelTime?: string | null
  closeTime?: string | null
  refundTime?: string | null
  expireAt?: string
  createAt: string
  payments?: PaymentVO[]
  refunds?: RefundVO[]
}

export interface PaymentVO {
  id: string
  paymentNo: string
  userId: string
  orderId: string
  orderNo: string
  amount: number
  subject: string
  status: number
  statusLabel: string
  channel: number
  channelLabel: string
  payMethod: number
  payMethodLabel: string
  outTradeNo: string
  channelTradeNo: string
  qrCodeUrl: string
  qrCodeBase64: string
  createAt: string
}

export interface RefundVO {
  id: string
  refundNo: string
  paymentId: string
  orderId: string
  userId: string
  amount: number
  reason: string
  channel: number
  channelLabel: string
  outRefundNo: string
  channelRefundNo: string
  status: number
  statusLabel: string
  createAt: string
}

export interface OrderStatusVO {
  orderId: string
  status: number
}

// ─── Request ─────────────────────────────────────────────

export interface TicketOrderCreateRequest {
  eventId: string
  venueId: string
  sessionId: string
  ticketTypeId: string
  passengerIds: string[]
}

export interface PaymentCreateRequest {
  channel: number
  payMethod: number
}

export interface RefundCreateRequest {
  reason: string
}

export interface TicketOrderPageRequest {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  userId?: string
  status?: number
}

// ─── Page Response ───────────────────────────────────────

export type PageResponseTicketOrderVO = PaginatedResponse<TicketOrderVO>
