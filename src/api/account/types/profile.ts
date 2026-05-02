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
  eventCoverUrlSnapshot?: string
  venueNameSnapshot?: string
  sessionStartAtSnapshot?: string
  totalAmount?: number
  quantity?: number
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
