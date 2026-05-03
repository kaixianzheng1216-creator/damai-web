import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

export const formatPrice = (price: number): string => {
  return `¥${(price / 100).toFixed(2)}`
}

export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  const min = formatPrice(minPrice)
  if (minPrice === maxPrice) {
    return min
  }
  const max = formatPrice(maxPrice)
  return `${min} — ${max}`
}

export const formatDateTimeWithWeekday = (dateTime: string | Date | undefined | null): string => {
  if (!dateTime) return ''
  const date = dayjs(dateTime)
  const weekday = date.locale('zh-cn').format('ddd')
  return `${date.year()}.${date.month() + 1}.${date.date()} ${weekday} ${date.format('HH:mm')}`
}

export const formatDateTime = (
  dateTime: string | Date | undefined | null,
  fallback: string = '',
): string => {
  if (!dateTime) return fallback
  const date = dayjs(dateTime)
  return `${date.year()}.${date.month() + 1}.${date.date()} ${date.format('HH:mm')}`
}

export const formatDateTimeLocalInput = (dateTime: string | Date | undefined | null): string => {
  if (!dateTime) return ''
  return dayjs(dateTime).format('YYYY-MM-DDTHH:mm')
}

export const formatDate = (dateTime: string | Date | undefined | null): string => {
  if (!dateTime) return ''
  const date = dayjs(dateTime)
  return `${date.year()}.${date.month() + 1}.${date.date()}`
}

export const formatDateTimeRange = (
  start: string | Date | undefined | null,
  end: string | Date | undefined | null,
): string => {
  if (!start) return ''
  const startDate = dayjs(start)
  const startStr = `${startDate.year()}.${startDate.month() + 1}.${startDate.date()} ${startDate.format('HH:mm')}`

  if (!end) return startStr

  const endDate = dayjs(end)
  const isSameDay = startDate.isSame(endDate, 'day')

  if (isSameDay) {
    return `${startStr} — ${endDate.format('HH:mm')}`
  }

  const endStr = `${endDate.year()}.${endDate.month() + 1}.${endDate.date()} ${endDate.format('HH:mm')}`
  return `${startStr} — ${endStr}`
}
