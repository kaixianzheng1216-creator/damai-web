import dayjs from 'dayjs'

export const formatPrice = (price: number): string => {
  return `¥${(price / 100).toFixed(2)}`
}

export const formatDateTime = (dateTime: string | Date): string => {
  if (!dateTime) return ''
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

export const formatDateTimeLocalInput = (dateTime: string | Date): string => {
  if (!dateTime) return ''
  return dayjs(dateTime).format('YYYY-MM-DDTHH:mm')
}
