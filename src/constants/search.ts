export const DEFAULT_SEARCH_QUERY = {
  keyword: '',
  cityId: undefined,
  categoryId: undefined,
  timeType: 0,
  date: undefined,
  sortType: 0,
  sortField: 'recommendWeight',
  sortOrder: 'desc',
  page: 1,
  size: 10,
} as const

export const TIME_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '今天', value: 1 },
  { label: '本周末', value: 2 },
  { label: '一个月内', value: 3 },
  { label: '按日历', value: 4 },
] as const

export const SORT_OPTIONS = [
  { label: '推荐', value: 0 },
  { label: '最近开场', value: 1 },
  { label: '最新上架', value: 2 },
] as const
