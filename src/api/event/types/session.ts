import type { TicketTypeVO } from './ticketType'

// ─── Session ─────────────────────────────────────────────

export interface SessionItem {
  name: string
  startAt?: string
  endAt?: string
}

export interface SessionBatchCreateRequest {
  sessions: SessionItem[]
}

export interface SessionUpdateRequest {
  name?: string
  startAt?: string
  endAt?: string
  status?: number
}

export interface SessionVO {
  id: string
  eventId?: string
  name: string
  startAt: string
  endAt: string
  status: number
  statusLabel: string
  ticketTypes: TicketTypeVO[]
}
