import { request } from '@/api/request'
import type { UserVO, UserUpdateRequest } from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchUserInfo = (): Promise<UserVO> =>
  request.get<UserVO>('/api/account/front/user/info')

export const updateUserInfo = (data: UserUpdateRequest): Promise<void> =>
  request.put<void>('/api/account/front/user/info', data)
