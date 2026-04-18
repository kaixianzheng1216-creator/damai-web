import dayjs from 'dayjs'

export const formatPrice = (price: number): string => {
  return `¥${(price / 100).toFixed(2)}`
}

export const formatDateTime = (dateTime: string | Date): string => {
  if (!dateTime) return ''
  const date = dayjs(dateTime)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.day()]
  return `${date.year()}.${date.month() + 1}.${date.date()} ${weekday} ${date.format('HH:mm')}`
}

export const formatDateTimeLocalInput = (dateTime: string | Date): string => {
  if (!dateTime) return ''
  return dayjs(dateTime).format('YYYY-MM-DDTHH:mm')
}
