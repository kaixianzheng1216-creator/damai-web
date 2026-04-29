import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, ref, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createRefund, type TicketOrderVO } from '@/api/trade'
import { ORDER_STATUS } from '@/constants'
import { useRefundDialog } from '../useRefundDialog'

vi.mock('@/api/trade', () => ({
  createRefund: vi.fn(),
}))

vi.mock('vue3-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const createOrder = (overrides: Partial<TicketOrderVO> = {}): TicketOrderVO => ({
  id: 'order-1',
  orderNo: 'NO-1',
  status: ORDER_STATUS.PAID,
  statusLabel: '已支付',
  sessionStartAtSnapshot: '2099-05-01T19:30:00.000Z',
  totalAmount: 199,
  quantity: 1,
  createAt: '2026-04-28T10:00:00.000Z',
  ...overrides,
})

function setupRefundDialog(order = ref<TicketOrderVO | null>(createOrder())) {
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
    return scope.run(() => useRefundDialog({ order }))
  })

  if (!result) {
    throw new Error('useRefundDialog did not initialize')
  }

  return {
    result,
    order,
    invalidateSpy,
    cleanup: () => {
      scope?.stop()
      queryClient.clear()
    },
  }
}

let cleanup: (() => void) | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  vi.clearAllMocks()
})

describe('useRefundDialog', () => {
  it('submits refunds and invalidates order plus status queries', async () => {
    vi.mocked(createRefund).mockResolvedValue({
      id: 'refund-1',
      refundNo: 'REF-1',
      paymentId: 'payment-1',
      orderId: 'order-1',
      userId: 'user-1',
      amount: 199,
      reason: '行程冲突',
      channel: 1,
      channelLabel: '支付宝',
      outRefundNo: 'OUT-1',
      channelRefundNo: '',
      status: 0,
      statusLabel: '退款中',
      createAt: '2026-04-28T10:00:00.000Z',
    })
    const harness = setupRefundDialog()
    cleanup = harness.cleanup

    expect(harness.result.canRefund.value).toBe(true)
    harness.result.openRefundDialog()
    expect(harness.result.showRefundDialog.value).toBe(true)

    await harness.result.refundMutation.mutateAsync('行程冲突')

    expect(createRefund).toHaveBeenCalledWith('order-1', { reason: '行程冲突' })
    expect(harness.result.showRefundDialog.value).toBe(false)
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ticket-order', 'order-1'] })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['order-status', 'order-1'] })
  })

  it('keeps the dialog closed when the current order is not refundable', () => {
    const harness = setupRefundDialog(ref(createOrder({ status: ORDER_STATUS.CANCELLED })))
    cleanup = harness.cleanup

    expect(harness.result.canRefund.value).toBe(false)
    harness.result.openRefundDialog()
    expect(harness.result.showRefundDialog.value).toBe(false)
  })
})
