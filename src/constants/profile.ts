export type ProfileSectionKey = 'orders' | 'tickets' | 'info' | 'passengers'

export interface ProfileSectionOption {
  key: ProfileSectionKey
  label: string
  group: 'trade' | 'account'
  icon: string
}

export const PROFILE_SECTIONS: ProfileSectionOption[] = [
  { key: 'orders', label: '订单管理', group: 'trade', icon: 'shopping-bag' },
  { key: 'tickets', label: '我的电子票', group: 'trade', icon: 'ticket' },
  { key: 'info', label: '个人信息', group: 'account', icon: 'user' },
  { key: 'passengers', label: '常用购票人', group: 'account', icon: 'users' },
]

export const HEADER_PROFILE_MENU_ITEMS: Array<{ section: ProfileSectionKey; label: string }> = [
  { section: 'orders', label: '订单管理' },
  { section: 'tickets', label: '我的电子票' },
  { section: 'info', label: '个人信息' },
  { section: 'passengers', label: '常用购票人' },
]

export const PASSENGER_CERT_TYPES = ['身份证'] as const

export const PROFILE_DIALOG_COPY = {
  deletePassengerTitle: '删除确认',
  deletePassengerDescription: '确认删除该购票人吗？删除后不可恢复。',
  deletePassengerConfirmText: '删除',
} as const

export const PROFILE_CONFIG = {
  YEAR_RANGE: 26,
  MONTH_COUNT: 12,
  DAY_COUNT: 31,
  START_YEAR: new Date().getFullYear(),
  BIRTH_YEAR_DEFAULT: '2002',
  BIRTH_MONTH_DEFAULT: '1',
  BIRTH_DAY_DEFAULT: '1',
  GENDER_DEFAULT: 'male' as const,
  SMS_VERIFICATION_COUNTDOWN: 60,
}
