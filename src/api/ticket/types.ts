import type { PaginatedResponse } from '../types'

export interface TicketPageRequest {
  page: number
  size: number
  sortField?: string
  sortOrder?: string
  userId?: string
  orderId?: string
  eventId?: string
  sessionId?: string
  status?: number
  validSize?: number
  validPage?: number
}

export interface TicketVO {
  id: string
  ticketNo: string
  qrCodeToken: string
  qrCodeBase64: string
  userId: string
  orderId: string
  orderNo: string
  passengerId: string
  passengerNameSnapshot: string
  passengerIdTypeSnapshot: number
  passengerIdNoMaskedSnapshot: string
  eventId: string
  eventNameSnapshot: string
  eventCoverUrlSnapshot: string
  venueId: string
  venueNameSnapshot: string
  venueAddressSnapshot: string
  sessionId: string
  sessionNameSnapshot: string
  sessionStartAtSnapshot: string
  ticketTypeId: string
  ticketTypeNameSnapshot: string
  status: number
  statusLabel: string
  usedAt?: string
  createAt: string
}

export type PageResponseTicketVO = PaginatedResponse<TicketVO>
