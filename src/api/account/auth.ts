import { request } from '@/api/request'
import type { LoginParams, LoginResponse, SendCodeParams } from './types'

export const sendVerifyCode = (data: SendCodeParams): Promise<void> =>
  request.post<void>('/api/auth/auth/verify-code', data)

export const login = (data: LoginParams): Promise<LoginResponse> =>
  request.post<LoginResponse>('/api/auth/auth/login', data)

export const logout = (): Promise<void> =>
  request.post<void>('/api/auth/auth/logout')
