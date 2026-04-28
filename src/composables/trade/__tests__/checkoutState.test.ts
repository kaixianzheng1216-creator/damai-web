import { describe, expect, it } from 'vitest'
import { ORDER_STATUS } from '@/constants'
import {
  formatRemainText,
  getCheckoutStatusFlags,
  getRemainSeconds,
  resolveCheckoutPaymentInfo,
} from '../checkoutState'

describe('checkout state helpers', () => {
  it('derives checkout status flags from order status', () => {
    expect(getCheckoutStatusFlags(ORDER_STATUS.PENDING)).toEqual({
      isPending: true,
      isPaid: false,
      isCancelled: false,
      isClosed: false,
    })

    expect(getCheckoutStatusFlags(ORDER_STATUS.PAID)).toMatchObject({
      isPending: false,
      isPaid: true,
    })
  })

  it('formats remaining payment time and clamps expired orders to zero', () => {
    const now = new Date('2026-04-28T10:00:00.000Z')

    expect(getRemainSeconds('2026-04-28T10:15:05.000Z', now)).toBe(905)
    expect(formatRemainText(905)).toBe('15:05')
    expect(formatRemainText(-1)).toBe('00:00')
    expect(getRemainSeconds('bad-date', now)).toBe(0)
  })

  it('prefers freshly created payment info over order snapshot payment info', () => {
    expect(
      resolveCheckoutPaymentInfo(
        {
          qrCodeBase64: 'new-qr',
          outTradeNo: '',
          paymentNo: 'new-payment',
        },
        [
          {
            qrCodeBase64: 'old-qr',
            outTradeNo: 'old-trade',
            paymentNo: 'old-payment',
          },
        ],
      ),
    ).toEqual({
      qrCodeBase64: 'new-qr',
      tradeNo: 'new-payment',
    })
  })
})
