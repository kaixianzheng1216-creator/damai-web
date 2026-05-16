import type { PaymentVO } from '@/api/trade'
import dayjs from 'dayjs'
import { ORDER_STATUS } from '@/constants'

type PaymentInfoSource = Pick<PaymentVO, 'id' | 'qrCodeBase64' | 'outTradeNo' | 'paymentNo'>

export function getCheckoutStatusFlags(status: number) {
  return {
    isPending: status === ORDER_STATUS.PENDING,
    isPaid: status === ORDER_STATUS.PAID,
    isCancelled: status === ORDER_STATUS.CANCELLED,
    isClosed: status === ORDER_STATUS.CLOSED,
  }
}

export function getRemainSeconds(expireAt: string | undefined, now: Date) {
  if (!expireAt) {
    return 0
  }

  const expire = dayjs(expireAt)

  if (!expire.isValid()) {
    return 0
  }

  const left = expire.diff(dayjs(now), 'second')
  return Math.max(0, left)
}

export function formatRemainText(remainSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(remainSeconds))
  return dayjs().startOf('day').second(safeSeconds).format('mm:ss')
}

export function resolveCheckoutPaymentInfo(
  paymentData: PaymentInfoSource | null | undefined,
  orderPayments: readonly PaymentInfoSource[] | undefined,
) {
  const firstOrderPayment = orderPayments?.[0]

  return {
    paymentId: paymentData?.id || firstOrderPayment?.id || '',
    qrCodeBase64: paymentData?.qrCodeBase64 || firstOrderPayment?.qrCodeBase64 || '',
    tradeNo:
      paymentData?.outTradeNo ||
      paymentData?.paymentNo ||
      firstOrderPayment?.outTradeNo ||
      firstOrderPayment?.paymentNo ||
      '',
  }
}
