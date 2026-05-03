import type { PaginatedResponse } from '@/api/types'

// ─── Admin ───────────────────────────────────────────────

export interface AdminVO {
  id: string
  username: string
  mobile: string
  avatarUrl: string
  status: number
  statusLabel: string
}

export interface AdminCreateRequest {
  mobile: string
  username?: string
}

export interface AdminUpdateRequest {
  username?: string
  mobile?: string
  avatarUrl?: string
}

export interface AdminPageRequest {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  username?: string
  mobile?: string
  status?: number
}

export type PageResponseAdminVO = PaginatedResponse<AdminVO>
