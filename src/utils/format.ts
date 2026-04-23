import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

export const formatPrice = (price: number): string => {
  return `¥${(price / 100).toFixed(2)}`
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

export const formatDateTimeWithoutWeekday = formatDateTime

export const formatDateTimeLocalInput = (dateTime: string | Date | undefined | null): string => {
  if (!dateTime) return ''
  return dayjs(dateTime).format('YYYY-MM-DDTHH:mm')
}

export const formatDate = (dateTime: string | Date | undefined | null): string => {
  if (!dateTime) return ''
  const date = dayjs(dateTime)
  return `${date.year()}.${date.month() + 1}.${date.date()}`
}
