import { request } from '@/api/request'
import type { UserVO, UserUpdateRequest, UserPageRequest, PageResponseUserVO } from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchUserInfo = (): Promise<UserVO> =>
  request.get<UserVO>('/api/account/front/user/info')

export const updateUserInfo = (data: UserUpdateRequest): Promise<void> =>
  request.put<void>('/api/account/front/user/info', data)

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminUserPage = (params: UserPageRequest): Promise<PageResponseUserVO> =>
  request.get<PageResponseUserVO>('/api/account/admin/user/page', { params })

export const fetchAdminUserById = (id: string): Promise<UserVO> =>
  request.get<UserVO>(`/api/account/admin/user/${id}`)

export const updateAdminUserStatus = (id: string, status: 0 | 1): Promise<void> =>
  request.put<void>(`/api/account/admin/user/${id}/status`, status)
