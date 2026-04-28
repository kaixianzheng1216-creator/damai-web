import { afterEach, describe, expect, it, vi } from 'vitest'
import type { EffectScope } from 'vue'
import type { PageResponsePassengerVO } from '@/api/account'
import type { EventDetailVO, TicketTypeVO } from '@/api/event'
import { TICKET_TYPE_STATUS } from '@/constants'

const createTicketType = (overrides: Partial<TicketTypeVO> = {}): TicketTypeVO => ({
  id: 'ticket-1',
  sessionId: 'session-1',
  name: '看台',
  salePrice: 188,
  orderLimit: 2,
  accountLimit: 3,
  status: TICKET_TYPE_STATUS.ON_SALE,
  statusLabel: '销售中',
  saleStartAt: '2000-01-01T00:00:00.000Z',
  saleEndAt: '2099-01-01T00:00:00.000Z',
  ...overrides,
})

const createDetail = (): EventDetailVO => ({
  event: {
    id: 'event-1',
    categoryId: 'category-1',
    venueId: 'venue-1',
    cityId: 'city-1',
    name: '测试演出',
    coverUrl: 'cover.png',
    status: 1,
  },
  info: {
    description: '演出详情',
    purchaseNotice: [],
    admissionNotice: [],
  },
  participants: [],
  services: [],
  sessions: [
    {
      id: 'session-1',
      name: '第一场',
      startAt: '2026-05-01T19:30:00.000Z',
      endAt: '2026-05-01T21:30:00.000Z',
      status: 1,
      statusLabel: '正常',
      ticketTypes: [createTicketType()],
    },
  ],
  seriesEvents: [],
})

const createPassengerPage = (): PageResponsePassengerVO => ({
  pageNumber: 1,
  pageSize: 100,
  totalRow: 1,
  totalPage: 1,
  records: [
    {
      id: 'passenger-1',
      userId: 'user-1',
      name: '张三',
      idType: 1,
      idTypeLabel: '身份证',
      idNoMasked: '110***',
    },
  ],
})

async function setupEventDetailPage({ loggedIn = true } = {}) {
  vi.resetModules()

  const userStoreMock = { isLoggedIn: loggedIn }
  const { createApp, effectScope, nextTick } = await import('vue')
  const { QueryClient, VueQueryPlugin } = await import('@tanstack/vue-query')
  const route = {
    params: { id: 'event-1' },
    fullPath: '/detail/event-1',
  }
  const push = vi.fn()

  vi.doMock('vue-router', () => ({
    useRoute: () => route,
    useRouter: () => ({ push }),
  }))
  vi.doMock('@/stores/user', () => ({
    useUserStore: () => userStoreMock,
  }))
  vi.doMock('@/api/account', () => ({
    fetchPassengerPage: vi.fn().mockResolvedValue(createPassengerPage()),
  }))
  vi.doMock('@/api/event', () => ({
    fetchEventDetailById: vi.fn().mockResolvedValue(createDetail()),
    checkIsFollowedEvent: vi.fn().mockResolvedValue(false),
    followEvent: vi.fn().mockResolvedValue(undefined),
    unfollowEvent: vi.fn().mockResolvedValue(undefined),
  }))
  vi.doMock('@/api/trade', () => ({
    fetchUserPurchaseCounts: vi.fn().mockResolvedValue({ 'ticket-1': 0 }),
    createTicketOrder: vi.fn().mockResolvedValue({
      orderId: 'order-1',
      status: 0,
    }),
  }))

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const app = createApp({})
  let scope: EffectScope | undefined

  app.use(VueQueryPlugin, { queryClient })

  const { useEventDetailPage } = await import('../useEventDetailPage')
  const tradeApi = await import('@/api/trade')
  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() => useEventDetailPage())
  })

  if (!result) {
    throw new Error('useEventDetailPage did not initialize')
  }

  const flush = async () => {
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
    await nextTick()
  }

  await flush()

  return {
    result,
    push,
    tradeApi,
    cleanup: () => {
      scope?.stop()
      queryClient.clear()
      vi.doUnmock('vue-router')
      vi.doUnmock('@/stores/user')
      vi.doUnmock('@/api/account')
      vi.doUnmock('@/api/event')
      vi.doUnmock('@/api/trade')
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('vue-router')
  vi.doUnmock('@/stores/user')
  vi.doUnmock('@/api/account')
  vi.doUnmock('@/api/event')
  vi.doUnmock('@/api/trade')
})

describe('useEventDetailPage', () => {
  it('redirects anonymous users to login before buying', async () => {
    const harness = await setupEventDetailPage({ loggedIn: false })

    await harness.result.handleBuyNow()

    expect(harness.push).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/detail/event-1' },
    })
    expect(harness.result.showPassengerModal.value).toBe(false)

    harness.cleanup()
  })

  it('opens passenger dialog and creates an order for logged-in users', async () => {
    const harness = await setupEventDetailPage({ loggedIn: true })

    expect(harness.result.selectedSessionId.value).toBe('session-1')
    expect(harness.result.selectedTicketTypeId.value).toBe('ticket-1')
    expect(harness.result.selectedPassengerIds.value).toEqual(['passenger-1'])
    expect(harness.tradeApi.fetchUserPurchaseCounts).toHaveBeenCalledWith(['ticket-1'])

    await harness.result.handleBuyNow()
    expect(harness.result.showPassengerModal.value).toBe(true)

    await harness.result.confirmPassengerAndCreateOrder()

    expect(harness.tradeApi.createTicketOrder).toHaveBeenCalled()
    expect(vi.mocked(harness.tradeApi.createTicketOrder).mock.calls[0]?.[0]).toEqual({
      eventId: 'event-1',
      venueId: 'venue-1',
      sessionId: 'session-1',
      ticketTypeId: 'ticket-1',
      passengerIds: ['passenger-1'],
    })
    expect(harness.result.showPassengerModal.value).toBe(false)
    expect(harness.push).toHaveBeenCalledWith('/checkout/order-1')

    harness.cleanup()
  })
})
