export const ADMIN_COLUMN_WIDTH = {
  avatar: 72,
  image: 96,
  status: 96,
  boolean: 112,
  actionsSm: 128,
  actionsMd: 176,
  actionsLg: 240,
  actionsXl: 320,
  phone: 160,
  dateTime: 180,
  sort: 80,
  city: 120,
  region: 120,
  name: 180,
  title: 240,
  url: 240,
  code: 180,
  amount: 120,
  count: 96,
  type: 120,
  entityId: 140,
  description: 240,
} as const

export const fixedColumn = (width: number) => ({
  size: width,
})

export const contentColumn = fixedColumn
