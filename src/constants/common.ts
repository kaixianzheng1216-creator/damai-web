export const COMMON_CONFIG = {
  DEFAULT_CITY: '北京',
  TABLET_BREAKPOINT: 1024,
} as const

export const AVATAR_PLACEHOLDERS = {
  SMALL: 'https://placehold.jp/32x32.png?text=U',
  LARGE: 'https://placehold.jp/80x80.png?text=U',
} as const

export const TIME_UNITS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 60 * 60,
} as const

export const REQUEST_CONFIG = {
  DEFAULT_TIMEOUT_MS: 10000,
} as const
