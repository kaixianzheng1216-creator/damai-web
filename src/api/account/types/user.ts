import type { PaginatedResponse } from '../../types'

// ─── User ────────────────────────────────────────────────

export interface UserVO {
  id: string
  username: string
  mobile: string
  avatarUrl: string
  status: number
  statusLabel: string
}

export interface UserUpdateRequest {
  username?: string
  mobile?: string
  avatarUrl?: string
}

export interface UserPageRequest {
  page?: number
  size?: number
  username?: string
  mobile?: string
  status?: number
}

export type PageResponseUserVO = PaginatedResponse<UserVO>
