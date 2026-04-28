import type { PaginatedResponse } from '../types'

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

// ─── Profile (Frontend Display) ──────────────────────────

export interface PassengerItem {
  id: string
  name: string
  certType: string
  certNo: string
}

export type OrderStatus = '待付款' | '已支付' | '已完成' | '已取消'

export interface ProfileInfo {
  nickname: string
  gender: 'male' | 'female'
  birthYear: string
  birthMonth: string
  birthDay: string
}

export interface OrderItem {
  id: string
  orderNo?: string
  title: string
  datetime: string
  amount: string
  status: number
  statusLabel: OrderStatus
}

export interface AccountSettingItem {
  key: 'mobile' | 'identity'
  title: string
  description: string
  value: string
  actionText: string
  status: 'success' | 'warning'
}

export interface PassengerFormData {
  name: string
  certType: string
  certNo: string
}

export interface MobileFormData {
  mobile: string
  code: string
}

export interface IdentityFormData {
  realName: string
  idCard: string
}
