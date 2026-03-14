import { request } from '@/api/request'
import type { LoginParams, RegisterParams, AuthResponse } from '@/types/auth'

export const login = (data: LoginParams) => {
  return request.post<AuthResponse>('/auth/login', data)
}

export const register = (data: RegisterParams) => {
  return request.post<AuthResponse>('/auth/register', data)
}

export const logout = () => {
  return request.post<void>('/auth/logout')
}

export const getUserInfo = () => {
  return request.get<AuthResponse['user']>('/auth/me')
}
