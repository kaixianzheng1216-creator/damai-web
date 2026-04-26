import type { PaginatedResponse } from '../types'

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

export interface WorkOrderVO {
  id: string
  userId?: string
  workOrderNo?: string
  type?: number
  typeLabel?: string
  status: number
  statusLabel: string
  relatedOrderId?: string
  relatedTicketId?: string
  title: string
  content?: string
  lastReplyPreview?: string
  lastReplyAt?: string | null
  userHasUnread?: number
  adminHasUnread?: number
  createAt?: string
  closedByType?: number
  closedBy?: string
}

export interface WorkOrderReplyVO {
  id: string
  senderType: number
  content: string
  createAt?: string
}

export interface WorkOrderDetailVO extends WorkOrderVO {
  replies?: WorkOrderReplyVO[]
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

export interface WorkOrderPageRequest {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  userId?: string
  status?: number
}

export interface WorkOrderReplyCreateRequest {
  content: string
}

// ─── Page Response ───────────────────────────────────────

export type PageResponseTicketOrderVO = PaginatedResponse<TicketOrderVO>
export type PageResponseWorkOrderVO = PaginatedResponse<WorkOrderVO>
