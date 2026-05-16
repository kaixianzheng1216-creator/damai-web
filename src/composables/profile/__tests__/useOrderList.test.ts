import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { fetchMyOrderPage } from '@/api/trade'
import { ORDER_STATUS } from '@/constants'
import { useOrderList } from '../useOrderList'
import type { PageResponseTicketOrderVO, TicketOrderVO } from '@/api/trade'

vi.mock('@/api/trade', () => ({
  fetchMyOrderPage: vi.fn(),
}))

const createOrder = (overrides: Partial<TicketOrderVO> = {}): TicketOrderVO => ({
  id: 'order-1',
  orderNo: 'ORDER001',
  eventNameSnapshot: '测试活动',
  status: ORDER_STATUS.PAID,
  statusLabel: '已支付',
  createAt: '2026-05-16 18:00:00',
  ...overrides,
})

const createPage = (records: TicketOrderVO[] = []): PageResponseTicketOrderVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

function setupOrderList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const app = createApp({})
  let scope: EffectScope | undefined

  app.use(VueQueryPlugin, { queryClient })

  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() => useOrderList())
  })

  if (!result) {
    throw new Error('useOrderList did not initialize')
  }

  return {
    result,
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

describe('useOrderList', () => {
  it('loads orders without status when filter is all', async () => {
    const order = createOrder()
    vi.mocked(fetchMyOrderPage).mockResolvedValue(createPage([order]))
    const harness = setupOrderList()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(fetchMyOrderPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        status: undefined,
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.paginatedOrders.value).toHaveLength(1)
    })
    expect(harness.result.orderTotalRow.value).toBe(1)
    expect(harness.result.orderTotalPages.value).toBe(1)
  })

  it('maps completed filter to closed status and resets page to 1', async () => {
    vi.mocked(fetchMyOrderPage).mockResolvedValue(createPage())
    const harness = setupOrderList()
    cleanup = harness.cleanup

    harness.result.updateOrderPage(3)
    await nextTick()

    harness.result.orderFilter.value = 'done'
    await nextTick()

    expect(harness.result.orderPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(fetchMyOrderPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        status: ORDER_STATUS.CLOSED,
      })
    })
  })

  it('maps refunded filter to refunded status', async () => {
    vi.mocked(fetchMyOrderPage).mockResolvedValue(createPage())
    const harness = setupOrderList()
    cleanup = harness.cleanup

    harness.result.orderFilter.value = 'refunded'
    await nextTick()

    await vi.waitFor(() => {
      expect(fetchMyOrderPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        status: ORDER_STATUS.REFUNDED,
      })
    })
  })
})
