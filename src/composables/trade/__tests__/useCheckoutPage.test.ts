import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import {
  cancelTicketOrder,
  createPayment,
  fetchMyOrderById,
  fetchMyOrderStatus,
  fetchOrderById,
  fetchOrderStatus,
  queryPaymentStatus,
  type PaymentVO,
  type TicketOrderVO,
} from '@/api/trade'
import { ORDER_STATUS, PAYMENT_CHANNELS, PAYMENT_METHODS } from '@/constants'
import { useCheckoutPage } from '../useCheckoutPage'

const routerMocks = vi.hoisted(() => ({
  route: { params: { id: 'order-1' } },
  push: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routerMocks.route,
  useRouter: () => ({ push: routerMocks.push }),
}))

vi.mock('vue3-toastify', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

vi.mock('@/api/trade', () => ({
  fetchOrderById: vi.fn(),
  fetchMyOrderById: vi.fn(),
  fetchOrderStatus: vi.fn(),
  fetchMyOrderStatus: vi.fn(),
  createPayment: vi.fn(),
  queryPaymentStatus: vi.fn(),
  cancelTicketOrder: vi.fn(),
}))

const createOrder = (): TicketOrderVO => ({
  id: 'order-1',
  orderNo: 'NO-1',
  status: ORDER_STATUS.PENDING,
  statusLabel: '待支付',
  createAt: '2026-04-28T10:00:00.000Z',
  expireAt: '2026-04-28T10:15:00.000Z',
  eventId: 'event-1',
  eventNameSnapshot: '测试演出',
  eventCoverUrlSnapshot: 'cover.png',
  venueNameSnapshot: '测试场馆',
  venueAddressSnapshot: '测试地址',
  sessionNameSnapshot: '晚场',
  sessionStartAtSnapshot: '2026-04-28T19:30:00.000Z',
  ticketTypeNameSnapshot: '看台',
  quantity: 1,
  unitPrice: 199,
  totalAmount: 199,
})

const createPaymentResult = (): PaymentVO => ({
  id: 'payment-1',
  paymentNo: 'PAY-1',
  userId: 'user-1',
  orderId: 'order-1',
  orderNo: 'NO-1',
  amount: 199,
  subject: '测试演出',
  status: 0,
  statusLabel: '待支付',
  channel: PAYMENT_CHANNELS.ALIPAY,
  channelLabel: '支付宝',
  payMethod: PAYMENT_METHODS.QR_CODE,
  payMethodLabel: '扫码支付',
  outTradeNo: 'TRADE-1',
  channelTradeNo: '',
  qrCodeUrl: '',
  qrCodeBase64: 'new-qr',
  createAt: '2026-04-28T10:00:00.000Z',
})

const flushPromises = async () => {
  await Promise.resolve()
  await nextTick()
}

function setupCheckout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const app = createApp({})
  let scope: EffectScope | undefined

  app.use(VueQueryPlugin, { queryClient })

  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() => useCheckoutPage())
  })

  if (!result) {
    throw new Error('useCheckoutPage did not initialize')
  }

  return {
    result,
    queryClient,
    invalidateSpy,
    cleanup: () => {
      scope?.stop()
      queryClient.clear()
    },
  }
}

let cleanup: (() => void) | undefined

beforeEach(() => {
  routerMocks.route.params.id = 'order-1'
  vi.mocked(fetchOrderById).mockResolvedValue(createOrder())
  vi.mocked(fetchMyOrderById).mockResolvedValue(createOrder())
  vi.mocked(fetchOrderStatus).mockResolvedValue({
    orderId: 'order-1',
    status: ORDER_STATUS.PENDING,
  })
  vi.mocked(fetchMyOrderStatus).mockResolvedValue({
    orderId: 'order-1',
    status: ORDER_STATUS.PENDING,
  })
  vi.mocked(createPayment).mockResolvedValue(createPaymentResult())
  vi.mocked(queryPaymentStatus).mockResolvedValue(createPaymentResult())
  vi.mocked(cancelTicketOrder).mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  vi.restoreAllMocks()
})

describe('useCheckoutPage', () => {
  it('creates a payment with selected options and opens the QR dialog', async () => {
    const harness = setupCheckout()
    cleanup = harness.cleanup

    await harness.result.createPaymentMutation.mutateAsync()
    await flushPromises()

    expect(createPayment).toHaveBeenCalledWith('order-1', {
      channel: PAYMENT_CHANNELS.ALIPAY,
      payMethod: PAYMENT_METHODS.QR_CODE,
    })
    expect(harness.result.showQrCodeDialog.value).toBe(true)
    expect(harness.result.qrCodeBase64.value).toBe('new-qr')
    expect(harness.result.tradeNo.value).toBe('TRADE-1')
    expect(harness.invalidateSpy.mock.calls.map(([arg]) => arg.queryKey?.[0])).toEqual(
      expect.arrayContaining(['order-status', 'ticket-order']),
    )
  })

  it('queries payment status and invalidates order queries', async () => {
    const harness = setupCheckout()
    cleanup = harness.cleanup

    await harness.result.createPaymentMutation.mutateAsync()
    await harness.result.queryPaymentMutation.mutateAsync()
    await flushPromises()

    expect(queryPaymentStatus).toHaveBeenCalledWith('payment-1')
    expect(harness.result.tradeNo.value).toBe('TRADE-1')
    expect(harness.invalidateSpy.mock.calls.map(([arg]) => arg.queryKey?.[0])).toEqual(
      expect.arrayContaining(['order-status', 'ticket-order']),
    )
  })

  it('cancels the current order and invalidates order queries', async () => {
    const harness = setupCheckout()
    cleanup = harness.cleanup

    await harness.result.cancelTicketOrderMutation.mutateAsync()
    await flushPromises()

    expect(cancelTicketOrder).toHaveBeenCalledWith('order-1')
    expect(harness.invalidateSpy.mock.calls.map(([arg]) => arg.queryKey?.[0])).toEqual(
      expect.arrayContaining(['order-status', 'ticket-order']),
    )
  })

  it('redirects to orders when order status becomes PAID', async () => {
    const harness = setupCheckout()
    cleanup = harness.cleanup

    await flushPromises()

    harness.queryClient.setQueryData(['order-status', 'order-1'], {
      orderId: 'order-1',
      status: ORDER_STATUS.PAID,
    })
    await nextTick()

    expect(routerMocks.push).toHaveBeenCalledWith({
      path: '/profile',
      query: { section: 'orders' },
    })
    expect(harness.result.showQrCodeDialog.value).toBe(false)
  })

  it('rejects createPayment when order is not pending', async () => {
    const harness = setupCheckout()
    cleanup = harness.cleanup

    await flushPromises()

    harness.queryClient.setQueryData(['order-status', 'order-1'], {
      orderId: 'order-1',
      status: ORDER_STATUS.CANCELLED,
    })
    await nextTick()

    await expect(harness.result.createPaymentMutation.mutateAsync()).rejects.toThrow(
      'Order is not pending',
    )
  })

  it('shows error toast when payment creation fails', async () => {
    const { toast } = await import('vue3-toastify')
    vi.mocked(createPayment).mockRejectedValue(new Error('API error'))

    const harness = setupCheckout()
    cleanup = harness.cleanup

    await flushPromises()

    await expect(harness.result.createPaymentMutation.mutateAsync()).rejects.toThrow('API error')

    expect(toast.error).toHaveBeenCalled()
  })

  it('goDetail navigates to event detail page', async () => {
    const harness = setupCheckout()
    cleanup = harness.cleanup

    await flushPromises()

    harness.result.goDetail()

    expect(routerMocks.push).toHaveBeenCalledWith('/detail/event-1')
  })
})
