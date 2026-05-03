import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { useOrderListPage } from '../useOrderListPage'
import type { PageResponseTicketOrderVO, TicketOrderVO } from '@/api/trade'

const tradeMocks = vi.hoisted(() => ({
  fetchAdminOrderPage: vi.fn(),
  fetchAdminOrderById: vi.fn(),
}))

vi.mock('@/api/trade', () => ({
  fetchAdminOrderPage: tradeMocks.fetchAdminOrderPage,
  fetchAdminOrderById: tradeMocks.fetchAdminOrderById,
}))

const createOrder = (id = 'order-1'): TicketOrderVO => ({
  id,
  orderNo: `NO-${id}`,
  status: 1,
  statusLabel: '已支付',
  totalAmount: 188,
  quantity: 1,
  createAt: '2026-05-01T10:00:00.000Z',
})

const createPage = (records: TicketOrderVO[] = []): PageResponseTicketOrderVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

function setupOrderListPage() {
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
    return scope.run(() => useOrderListPage())
  })

  if (!result) {
    throw new Error('useOrderListPage did not initialize')
  }

  return {
    result,
    queryClient,
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

describe('useOrderListPage', () => {
  it('fetches admin orders with pagination and filter params', async () => {
    tradeMocks.fetchAdminOrderPage.mockResolvedValue(createPage([createOrder()]))
    const harness = setupOrderListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(tradeMocks.fetchAdminOrderPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        status: undefined,
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.list.value).toEqual([createOrder()])
    })

    harness.result.searchStatus.value = '1'
    await nextTick()

    await vi.waitFor(() => {
      expect(tradeMocks.fetchAdminOrderPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        status: 1,
      })
    })
  })

  it('resets pagination on search changes and owns detail dialog state', async () => {
    const order = createOrder('order-2')
    tradeMocks.fetchAdminOrderPage.mockResolvedValue(createPage([order]))
    const harness = setupOrderListPage()
    cleanup = harness.cleanup

    harness.result.currentPage.value = 3
    harness.result.searchStatus.value = '1'
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)

    tradeMocks.fetchAdminOrderById.mockResolvedValue(order)
    await harness.result.openDetail(order)
    expect(harness.result.selectedOrder.value).toEqual(order)
    expect(harness.result.showDetailDialog.value).toBe(true)

    harness.result.closeDetail()
    expect(harness.result.showDetailDialog.value).toBe(false)
  })
})
