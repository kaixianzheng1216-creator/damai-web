import type { PaymentVO } from '@/api/trade'
import { ORDER_STATUS, TIME_UNITS } from '@/constants'

type PaymentInfoSource = Pick<PaymentVO, 'qrCodeBase64' | 'outTradeNo' | 'paymentNo'>

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

  const expireTime = new Date(expireAt).getTime()

  if (!Number.isFinite(expireTime)) {
    return 0
  }

  const left = Math.floor((expireTime - now.getTime()) / TIME_UNITS.MILLISECONDS_PER_SECOND)
  return Math.max(0, left)
}

export function formatRemainText(remainSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(remainSeconds))
  const minutes = String(Math.floor(safeSeconds / TIME_UNITS.SECONDS_PER_MINUTE)).padStart(2, '0')
  const seconds = String(safeSeconds % TIME_UNITS.SECONDS_PER_MINUTE).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function resolveCheckoutPaymentInfo(
  paymentData: PaymentInfoSource | null | undefined,
  orderPayments: readonly PaymentInfoSource[] | undefined,
) {
  const firstOrderPayment = orderPayments?.[0]

  return {
    qrCodeBase64: paymentData?.qrCodeBase64 || firstOrderPayment?.qrCodeBase64 || '',
    tradeNo:
      paymentData?.outTradeNo ||
      paymentData?.paymentNo ||
      firstOrderPayment?.outTradeNo ||
      firstOrderPayment?.paymentNo ||
      '',
  }
}
