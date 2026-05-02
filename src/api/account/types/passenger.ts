import type { PaginatedResponse } from '../../types'

// ─── Passenger ───────────────────────────────────────────

export interface PassengerVO {
  id: string
  userId: string
  name: string
  idType: number
  idTypeLabel: string
  idNoMasked: string
}

export interface PassengerCreateRequest {
  name: string
  idType: number
  idNo: string
}

export interface PassengerPageRequest {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  name?: string
}

export type PageResponsePassengerVO = PaginatedResponse<PassengerVO>
