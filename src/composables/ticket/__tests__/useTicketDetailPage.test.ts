import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { fetchTicketById, type TicketVO } from '@/api/ticket'
import { useTicketDetailPage } from '../useTicketDetailPage'

const routerMocks = vi.hoisted(() => ({
  route: { params: { id: 'ticket-1' } },
  back: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routerMocks.route,
  useRouter: () => ({ back: routerMocks.back }),
}))

vi.mock('@/api/ticket', () => ({
  fetchTicketById: vi.fn(),
}))

const createTicket = (): TicketVO => ({
  id: 'ticket-1',
  ticketNo: 'TICKET-1',
  orderId: 'order-1',
  orderNo: 'NO-1',
  userId: 'user-1',
  eventId: 'event-1',
  eventNameSnapshot: '测试演出',
  venueNameSnapshot: '测试场馆',
  venueAddressSnapshot: '测试地址',
  sessionId: 'session-1',
  sessionStartAtSnapshot: '2026-05-01T19:30:00.000Z',
  ticketTypeId: 'ticket-type-1',
  ticketTypeNameSnapshot: '看台',
  passengerId: 'passenger-1',
  passengerNameSnapshot: '张三',
  status: 1,
  statusLabel: '未使用',
  qrCodeToken: 'qr-token',
  qrCodeBase64: 'qr',
  createAt: '2026-04-28T10:00:00.000Z',
})

function setupTicketDetail() {
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
    return scope.run(() => useTicketDetailPage())
  })

  if (!result) {
    throw new Error('useTicketDetailPage did not initialize')
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
  routerMocks.route.params.id = 'ticket-1'
})

describe('useTicketDetailPage', () => {
  it('fetches the ticket from a normalized route param', async () => {
    vi.mocked(fetchTicketById).mockResolvedValue(createTicket())
    const harness = setupTicketDetail()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(fetchTicketById).toHaveBeenCalledWith('ticket-1')
    })
    expect(harness.result.isEmpty.value).toBe(false)
  })

  it('does not fetch when the route id is missing', async () => {
    routerMocks.route.params.id = ''
    const harness = setupTicketDetail()
    cleanup = harness.cleanup

    expect(harness.result.isEmpty.value).toBe(true)
    expect(fetchTicketById).not.toHaveBeenCalled()

    harness.result.goBack()
    expect(routerMocks.back).toHaveBeenCalled()
  })
})
