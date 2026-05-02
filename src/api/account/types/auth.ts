import type { UserVO } from './user'

// ─── Auth ────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  user: UserVO
}

export interface LoginParams {
  mobile: string
  code: string
  accountType: 'user' | 'admin'
}

export interface SendCodeParams {
  mobile: string
  accountType: 'user' | 'admin'
}
