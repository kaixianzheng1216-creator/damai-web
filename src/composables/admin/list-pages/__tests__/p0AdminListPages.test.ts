import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { USER_STATUS, WORK_ORDER_STATUS } from '@/constants'
import { useAdminEventListPage } from '../useAdminEventListPage'
import { useAdminListPage } from '../useAdminListPage'
import { useAdminUserListPage } from '../useAdminUserListPage'
import { useAdminWorkOrderListPage } from '../useAdminWorkOrderListPage'
import type { AdminVO, PageResponseAdminVO, PageResponseUserVO, UserVO } from '@/api/account'
import type { AdminPageResponseEventVO, EventVO } from '@/api/event'
import type { PageResponseWorkOrderVO, WorkOrderDetailVO, WorkOrderVO } from '@/api/trade'

const accountAdminMocks = vi.hoisted(() => ({
  fetchAdminPage: vi.fn(),
  createAdmin: vi.fn(),
  updateAdmin: vi.fn(),
  updateAdminStatus: vi.fn(),
}))

const accountUserMocks = vi.hoisted(() => ({
  fetchAdminUserPage: vi.fn(),
  updateAdminUserStatus: vi.fn(),
}))

const eventMocks = vi.hoisted(() => ({
  fetchAdminEventPage: vi.fn(),
  deleteEvent: vi.fn(),
  publishEvent: vi.fn(),
  offlineEvent: vi.fn(),
  fetchAdminCityList: vi.fn(),
  fetchAdminCategoryList: vi.fn(),
}))

const tradeMocks = vi.hoisted(() => ({
  fetchAdminWorkOrderPage: vi.fn(),
  fetchAdminWorkOrderById: vi.fn(),
  submitAdminWorkOrderReply: vi.fn(),
  closeAdminWorkOrder: vi.fn(),
}))

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock('@/api/account/admin', () => accountAdminMocks)
vi.mock('@/api/account/user', () => accountUserMocks)
vi.mock('@/api/event/event', () => ({
  fetchAdminEventPage: eventMocks.fetchAdminEventPage,
  deleteEvent: eventMocks.deleteEvent,
  publishEvent: eventMocks.publishEvent,
  offlineEvent: eventMocks.offlineEvent,
}))
vi.mock('@/api/event/city', () => ({
  fetchAdminCityList: eventMocks.fetchAdminCityList,
}))
vi.mock('@/api/event/category', () => ({
  fetchAdminCategoryList: eventMocks.fetchAdminCategoryList,
}))
vi.mock('@/api/trade', () => tradeMocks)
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerMocks.push }),
}))

const createPage = <T>(records: T[]) => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

const createAdmin = (overrides: Partial<AdminVO> = {}): AdminVO => ({
  id: 'admin-1',
  username: 'operator',
  mobile: '13900139000',
  avatarUrl: '',
  status: USER_STATUS.NORMAL,
  statusLabel: '正常',
  ...overrides,
})

const createUser = (overrides: Partial<UserVO> = {}): UserVO => ({
  id: 'user-1',
  username: 'user',
  mobile: '13800138000',
  avatarUrl: '',
  status: USER_STATUS.NORMAL,
  statusLabel: '正常',
  ...overrides,
})

const createEvent = (overrides: Partial<EventVO> = {}): EventVO => ({
  id: 'event-1',
  categoryId: 'cat-1',
  venueId: 'venue-1',
  cityId: 'city-1',
  name: '测试演出',
  coverUrl: 'cover.png',
  status: 1,
  ...overrides,
})

const createWorkOrder = (overrides: Partial<WorkOrderVO> = {}): WorkOrderVO => ({
  id: 'work-order-1',
  title: '退款问题',
  status: WORK_ORDER_STATUS.PROCESSING,
  statusLabel: '处理中',
  ...overrides,
})

function setupComposable<T>(factory: () => T) {
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
    return scope.run(factory)
  })

  if (!result) {
    throw new Error('Composable did not initialize')
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
})

describe('P0 admin list page composables', () => {
  it('creates admins and invalidates only the admin list key', async () => {
    accountAdminMocks.fetchAdminPage.mockResolvedValue(
      createPage([createAdmin()]) satisfies PageResponseAdminVO,
    )
    accountAdminMocks.createAdmin.mockResolvedValue('admin-2')
    const harness = setupComposable(() => useAdminListPage())
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(accountAdminMocks.fetchAdminPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        username: undefined,
        mobile: undefined,
      })
    })

    harness.result.openCreate()
    harness.result.form.mobile = '13900139001'
    harness.result.form.username = 'new-admin'
    await harness.result.handleSubmit()

    expect(accountAdminMocks.createAdmin).toHaveBeenCalledWith({
      mobile: '13900139001',
      username: 'new-admin',
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-admins'] })
    expect(harness.result.showDialog.value).toBe(false)
  })

  it('filters users and invalidates only the user list after status changes', async () => {
    const user = createUser()
    accountUserMocks.fetchAdminUserPage.mockResolvedValue(
      createPage([user]) satisfies PageResponseUserVO,
    )
    accountUserMocks.updateAdminUserStatus.mockResolvedValue(undefined)
    const harness = setupComposable(() => useAdminUserListPage())
    cleanup = harness.cleanup

    harness.result.currentPage.value = 3
    harness.result.searchMobile.value = '13800138000'
    harness.result.handleSearch()
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(accountUserMocks.fetchAdminUserPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        username: undefined,
        mobile: '13800138000',
      })
    })

    harness.result.toggleStatus(user)

    await vi.waitFor(() => {
      expect(accountUserMocks.updateAdminUserStatus).toHaveBeenCalledWith(
        'user-1',
        USER_STATUS.BANNED,
      )
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-users'] })
  })

  it('resets event pagination on filters and confirms publish mutations', async () => {
    const event = createEvent()
    eventMocks.fetchAdminCityList.mockResolvedValue([])
    eventMocks.fetchAdminCategoryList.mockResolvedValue([])
    eventMocks.fetchAdminEventPage.mockResolvedValue(
      createPage([event]) satisfies AdminPageResponseEventVO,
    )
    eventMocks.publishEvent.mockResolvedValue(undefined)
    const harness = setupComposable(() => useAdminEventListPage())
    cleanup = harness.cleanup

    harness.result.currentPage.value = 4
    harness.result.searchName.value = '测试'
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(eventMocks.fetchAdminEventPage).toHaveBeenLastCalledWith({
        name: '测试',
        cityId: undefined,
        categoryId: undefined,
        page: 1,
        size: 10,
      })
    })

    harness.result.openCreate()
    expect(routerMocks.push).toHaveBeenCalledWith('/admin/events/create')

    harness.result.handlePublish(event)
    expect(harness.result.confirmDialog.value.open).toBe(true)

    await harness.result.handleConfirm()

    expect(eventMocks.publishEvent).toHaveBeenCalledWith('event-1')
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-events'] })
  })

  it('loads work order detail only after selection and keeps reply cache invalidation precise', async () => {
    const workOrder = createWorkOrder()
    const detail: WorkOrderDetailVO = { ...workOrder, replies: [] }
    tradeMocks.fetchAdminWorkOrderPage.mockResolvedValue(
      createPage([workOrder]) satisfies PageResponseWorkOrderVO,
    )
    tradeMocks.fetchAdminWorkOrderById.mockResolvedValue(detail)
    tradeMocks.submitAdminWorkOrderReply.mockResolvedValue(undefined)
    const harness = setupComposable(() => useAdminWorkOrderListPage())
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(tradeMocks.fetchAdminWorkOrderPage).toHaveBeenCalled()
    })
    expect(tradeMocks.fetchAdminWorkOrderById).not.toHaveBeenCalled()

    harness.result.openDetail(workOrder)
    await vi.waitFor(() => {
      expect(tradeMocks.fetchAdminWorkOrderById).toHaveBeenCalledWith('work-order-1')
    })

    await harness.result.submitReply()
    expect(harness.result.replyError.value).toBe('请输入回复内容')

    harness.result.replyContent.value = '已为你处理'
    await harness.result.submitReply()

    expect(tradeMocks.submitAdminWorkOrderReply).toHaveBeenCalledWith('work-order-1', {
      content: '已为你处理',
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['admin-work-order-list'],
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['admin-work-order-detail'],
    })
  })
})
