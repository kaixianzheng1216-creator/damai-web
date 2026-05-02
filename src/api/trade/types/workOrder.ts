import type { PaginatedResponse } from '../../types'

// ─── VO ──────────────────────────────────────────────────

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

export type PageResponseWorkOrderVO = PaginatedResponse<WorkOrderVO>
