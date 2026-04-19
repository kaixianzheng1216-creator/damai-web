export type DetailTabKey = 'detail' | 'purchase' | 'watch'

export const DETAIL_TABS: Array<{ label: string; value: DetailTabKey }> = [
  { label: '活动详情', value: 'detail' },
  { label: '购票须知', value: 'purchase' },
  { label: '观演须知', value: 'watch' },
]

export const EVENT_CONFIG = {
  DEFAULT_ORDER_LIMIT: 4,
} as const

export const TICKET_TYPE_STATUS = {
  ON_SALE: 1,
  OFF_SALE: 0,
} as const

export const EVENT_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
  OFFLINE: 2,
} as const

export const NOTICE_TYPE = {
  PURCHASE: 1,
  ADMISSION: 2,
} as const

export const NOTICE_TYPE_LABEL: Record<number, string> = {
  [NOTICE_TYPE.PURCHASE]: '购票须知',
  [NOTICE_TYPE.ADMISSION]: '入场须知',
} as const

export const BOOLEAN_TYPE = {
  YES: 1,
  NO: 0,
} as const
