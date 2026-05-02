import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, ref, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { closeMyWorkOrder, fetchMyWorkOrderPage, fetchMyWorkOrderById } from '@/api/trade'
import { WORK_ORDER_STATUS } from '@/constants'
import { useWorkOrderList } from '../useWorkOrderList'
import type { PageResponseWorkOrderVO, WorkOrderDetailVO, WorkOrderVO } from '@/api/trade'

const mockChatSendMessage = vi.fn()
const mockChatSubscribe = vi.fn()
const mockChatUnsubscribe = vi.fn()
const mockChatConnect = vi.fn()
const mockIsConnected = ref(false)

vi.mock('@/composables/common/useWorkOrderChat', () => ({
  useWorkOrderChat: () => ({
    isConnected: mockIsConnected,
    connect: mockChatConnect,
    subscribe: mockChatSubscribe,
    unsubscribe: mockChatUnsubscribe,
    sendMessage: mockChatSendMessage,
    disconnect: vi.fn(),
    onReconnect: vi.fn(),
    onError: vi.fn(),
  }),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    token: ref(null),
    isLoggedIn: ref(false),
  }),
}))

vi.mock('@/api/trade', () => ({
  fetchMyWorkOrderPage: vi.fn(),
  fetchMyWorkOrderById: vi.fn(),
  closeMyWorkOrder: vi.fn(),
}))

const createWorkOrder = (overrides: Partial<WorkOrderVO> = {}): WorkOrderVO => ({
  id: 'wo-1',
  title: '退款问题',
  status: WORK_ORDER_STATUS.PROCESSING,
  statusLabel: '处理中',
  ...overrides,
})

const createPage = <T>(records: T[]): PageResponseWorkOrderVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

const createDetail = (overrides: Partial<WorkOrderDetailVO> = {}): WorkOrderDetailVO => ({
  ...createWorkOrder(),
  replies: [],
  ...overrides,
})

function setupWorkOrderList() {
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
    return scope.run(() => useWorkOrderList())
  })

  if (!result) {
    throw new Error('useWorkOrderList did not initialize')
  }

  return {
    result,
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
  mockChatSendMessage.mockClear()
  mockChatSubscribe.mockClear()
  mockChatUnsubscribe.mockClear()
  mockChatConnect.mockClear()
})

describe('useWorkOrderList', () => {
  it('loads work order list with pagination', async () => {
    const workOrder = createWorkOrder()
    vi.mocked(fetchMyWorkOrderPage).mockResolvedValue(createPage([workOrder]))
    const harness = setupWorkOrderList()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(fetchMyWorkOrderPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        status: undefined,
        sortField: 'createAt',
        sortOrder: 'desc',
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.workOrders.value).toEqual([workOrder])
    })
    expect(harness.result.workOrderTotalRow.value).toBe(1)
    expect(harness.result.workOrderTotalPages.value).toBe(1)
  })

  it('filters by status and resets page to 1', async () => {
    vi.mocked(fetchMyWorkOrderPage).mockResolvedValue(createPage([]))
    const harness = setupWorkOrderList()
    cleanup = harness.cleanup

    harness.result.updateWorkOrderPage(3)
    await nextTick()

    harness.result.workOrderFilter.value = 'closed'
    await nextTick()

    expect(harness.result.workOrderPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(fetchMyWorkOrderPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        status: WORK_ORDER_STATUS.CLOSED,
        sortField: 'createAt',
        sortOrder: 'desc',
      })
    })
  })

  it('opens detail, loads detail, submits reply via WebSocket', async () => {
    const workOrder = createWorkOrder()
    const detail = createDetail({ id: 'wo-1', replies: [] })
    vi.mocked(fetchMyWorkOrderPage).mockResolvedValue(createPage([workOrder]))
    vi.mocked(fetchMyWorkOrderById).mockResolvedValue(detail)
    const harness = setupWorkOrderList()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchMyWorkOrderPage).toHaveBeenCalled())
    expect(fetchMyWorkOrderById).not.toHaveBeenCalled()

    harness.result.openWorkOrderDetail(workOrder)
    await vi.waitFor(() => {
      expect(fetchMyWorkOrderById).toHaveBeenCalledWith('wo-1')
    })
    expect(mockChatSubscribe).toHaveBeenCalledWith(
      'wo-1',
      expect.any(Function),
      expect.any(Function),
    )
    expect(harness.result.selectedWorkOrder.value).toEqual(detail)

    harness.result.replyContent.value = '   '
    await harness.result.submitWorkOrderReply()
    expect(harness.result.replyError.value).toBe('请输入回复内容')
    expect(mockChatSendMessage).not.toHaveBeenCalled()

    harness.result.replyContent.value = '已为你处理'
    await harness.result.submitWorkOrderReply()

    expect(mockChatSendMessage).toHaveBeenCalledWith('wo-1', '已为你处理')
    expect(harness.result.replyContent.value).toBe('')
  })

  it('prevents reply when work order is closed', async () => {
    const workOrder = createWorkOrder({ status: WORK_ORDER_STATUS.CLOSED })
    const detail = createDetail({ id: 'wo-1', status: WORK_ORDER_STATUS.CLOSED })
    vi.mocked(fetchMyWorkOrderPage).mockResolvedValue(createPage([workOrder]))
    vi.mocked(fetchMyWorkOrderById).mockResolvedValue(detail)
    const harness = setupWorkOrderList()
    cleanup = harness.cleanup

    harness.result.openWorkOrderDetail(workOrder)
    await vi.waitFor(() => expect(fetchMyWorkOrderById).toHaveBeenCalled())

    harness.result.replyContent.value = 'test reply'
    await harness.result.submitWorkOrderReply()

    expect(harness.result.replyError.value).toBe('工单已关闭，无法继续回复')
    expect(mockChatSendMessage).not.toHaveBeenCalled()
  })

  it('closes work order and invalidates queries', async () => {
    const workOrder = createWorkOrder()
    vi.mocked(fetchMyWorkOrderPage).mockResolvedValue(createPage([workOrder]))
    vi.mocked(closeMyWorkOrder).mockResolvedValue(undefined)
    const harness = setupWorkOrderList()
    cleanup = harness.cleanup

    harness.result.openWorkOrderDetail(workOrder)
    await vi.waitFor(() => expect(fetchMyWorkOrderById).toHaveBeenCalled())

    await harness.result.confirmCloseWorkOrder()

    expect(closeMyWorkOrder.mock.calls[0]?.[0]).toBe('wo-1')
    expect(harness.invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['my-work-order-page'],
    })
  })
})
