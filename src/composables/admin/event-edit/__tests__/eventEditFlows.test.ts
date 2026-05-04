import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, ref, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type {
  EventParticipantVO,
  EventServiceGuaranteeVO,
  EventVO,
  ServiceGuaranteeVO,
  SessionVO,
  TicketTypeVO,
} from '@/api/event'
import { TICKET_TYPE_STATUS, queryKeys } from '@/constants'
import { useEventBasicTab } from '../useEventBasicTab'
import { useEventParticipantsTab } from '../useEventParticipantsTab'
import { useEventServicesTab } from '../useEventServicesTab'
import { useInventoryAdjustDialog } from '../useInventoryAdjustDialog'
import { useSessionsAndTicketsTab } from '../useSessionsAndTicketsTab'
import { useTicketTypeDialog } from '../useTicketTypeDialog'

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

const eventApiMocks = vi.hoisted(() => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  adminCreateTicketType: vi.fn(),
  adminUpdateTicketType: vi.fn(),
  adminDeleteTicketType: vi.fn(),
  adminAdjustTicketTypeInventory: vi.fn(),
  adminBatchAddParticipants: vi.fn(),
  removeParticipant: vi.fn(),
  adminBatchAddServices: vi.fn(),
  adminDeleteEventService: vi.fn(),
}))

const optionApiMocks = vi.hoisted(() => ({
  fetchAdminCityList: vi.fn(),
  fetchAdminCategoryList: vi.fn(),
  fetchAdminVenueList: vi.fn(),
  fetchAdminSeriesList: vi.fn(),
  fetchAdminParticipantsPage: vi.fn(),
  fetchAdminServiceList: vi.fn(),
}))

vi.mock('vue3-toastify', () => ({
  toast: toastMocks,
}))

vi.mock('@/api/event/event', () => eventApiMocks)
vi.mock('@/api/event/city', () => ({ fetchAdminCityList: optionApiMocks.fetchAdminCityList }))
vi.mock('@/api/event/category', () => ({
  fetchAdminCategoryList: optionApiMocks.fetchAdminCategoryList,
}))
vi.mock('@/api/event/venue', () => ({ fetchAdminVenueList: optionApiMocks.fetchAdminVenueList }))
vi.mock('@/api/event/series', () => ({ fetchAdminSeriesList: optionApiMocks.fetchAdminSeriesList }))
vi.mock('@/api/event/participant', () => ({
  fetchAdminParticipantsPage: optionApiMocks.fetchAdminParticipantsPage,
}))
vi.mock('@/api/event/service', () => ({
  fetchAdminServiceList: optionApiMocks.fetchAdminServiceList,
}))

function setupComposable<T>(factory: () => T) {
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
    return scope.run(factory)
  })

  if (!result) {
    throw new Error('composable did not initialize')
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

const createTicketType = (): TicketTypeVO => ({
  id: 'ticket-1',
  sessionId: 'session-1',
  name: '看台',
  salePrice: 188,
  orderLimit: 2,
  accountLimit: 3,
  status: TICKET_TYPE_STATUS.ON_SALE,
  statusLabel: '销售中',
  saleStartAt: '2026-05-01T10:00:00.000Z',
  saleEndAt: '2026-05-02T10:00:00.000Z',
  inventory: {
    ticketTypeId: 'ticket-1',
    totalQty: 10,
    lockedQty: 0,
    soldQty: 0,
  },
})

const createEventParticipant = (participantId: string): EventParticipantVO => ({
  id: `event-participant-${participantId}`,
  sortOrder: 1,
  participant: {
    id: participantId,
    name: `参与方 ${participantId}`,
    avatarUrl: '',
  },
})

const createService = (): ServiceGuaranteeVO => ({
  id: 'service-2',
  name: '退票保障',
  sortOrder: 1,
  options: [
    {
      id: 'option-2',
      serviceGuaranteeId: 'service-2',
      name: '支持',
      description: '',
      isBooleanType: 1,
    },
  ],
})

const createEventService = (): EventServiceGuaranteeVO => ({
  id: 'event-service-1',
  serviceGuarantee: {
    id: 'service-1',
    name: '纸质票',
    sortOrder: 1,
    options: [],
  },
  serviceGuaranteeOption: {
    id: 'option-1',
    serviceGuaranteeId: 'service-1',
    name: '支持',
    description: '',
    isBooleanType: 1,
  },
})

const createEventVO = (overrides?: Partial<EventVO>): EventVO => ({
  id: 'event-1',
  categoryId: 'category-1',
  venueId: 'venue-1',
  cityId: 'city-1',
  name: '已存在的演出',
  coverUrl: 'cover.png',
  recommendWeight: 5,
  status: 1,
  seriesId: undefined,
  ...overrides,
})

const createSessionVO = (): SessionVO => ({
  id: 'session-1',
  eventId: 'event-1',
  name: '第一场',
  startAt: '2026-05-01T10:00:00.000Z',
  endAt: '2026-05-01T12:00:00.000Z',
  ticketTypes: [],
})

beforeEach(() => {
  eventApiMocks.createEvent.mockResolvedValue('event-new')
  eventApiMocks.updateEvent.mockResolvedValue(undefined)
  eventApiMocks.deleteEvent.mockResolvedValue(undefined)
  eventApiMocks.adminCreateTicketType.mockResolvedValue(undefined)
  eventApiMocks.adminUpdateTicketType.mockResolvedValue(undefined)
  eventApiMocks.adminDeleteTicketType.mockResolvedValue(undefined)
  eventApiMocks.adminAdjustTicketTypeInventory.mockResolvedValue(undefined)
  eventApiMocks.adminBatchAddParticipants.mockResolvedValue(undefined)
  eventApiMocks.removeParticipant.mockResolvedValue(undefined)
  eventApiMocks.adminBatchAddServices.mockResolvedValue(undefined)
  eventApiMocks.adminDeleteEventService.mockResolvedValue(undefined)

  optionApiMocks.fetchAdminCityList.mockResolvedValue([])
  optionApiMocks.fetchAdminCategoryList.mockResolvedValue([])
  optionApiMocks.fetchAdminVenueList.mockResolvedValue([])
  optionApiMocks.fetchAdminSeriesList.mockResolvedValue([])
  optionApiMocks.fetchAdminParticipantsPage.mockResolvedValue({
    pageNumber: 1,
    pageSize: 10,
    totalRow: 0,
    totalPage: 1,
    records: [],
  })
  optionApiMocks.fetchAdminServiceList.mockResolvedValue([])
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('event edit flows', () => {
  it('creates an event from the basic tab form', async () => {
    const onCreated = vi.fn()
    const harness = setupComposable(() =>
      useEventBasicTab({
        eventId: undefined,
        isEdit: false,
        eventData: undefined,
        onCreated,
        onUpdated: vi.fn(),
      }),
    )

    Object.assign(harness.result.basicForm, {
      name: '测试演出',
      categoryId: 'category-1',
      venueId: 'venue-1',
      cityId: 'city-1',
      coverUrl: 'cover.png',
      recommendWeight: 10,
      seriesId: 'none',
    })

    await harness.result.save()

    expect(eventApiMocks.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '测试演出',
        categoryId: 'category-1',
        venueId: 'venue-1',
        cityId: 'city-1',
        seriesId: undefined,
      }),
    )
    expect(onCreated).toHaveBeenCalledWith('event-new')
    expect(toastMocks.success).toHaveBeenCalledWith('活动创建成功')

    harness.cleanup()
  })

  it('validates and creates ticket types', async () => {
    const onSaved = vi.fn()
    const harness = setupComposable(() =>
      useTicketTypeDialog({
        eventId: 'event-1',
        sessionId: 'session-1',
        editingTicketType: null,
        onOpenChange: vi.fn(),
        onSaved,
      }),
    )

    await harness.result.handleSaveTicketType()
    expect(toastMocks.error).toHaveBeenCalledWith('请填写票种名称和有效售价')
    expect(eventApiMocks.adminCreateTicketType).not.toHaveBeenCalled()

    Object.assign(harness.result.form, {
      name: '看台',
      salePrice: 188,
      totalQty: 10,
      orderLimit: 2,
      accountLimit: 3,
      saleStartAt: '2026-05-01T10:00',
      saleEndAt: '2026-05-02T10:00',
    })

    await harness.result.handleSaveTicketType()

    expect(eventApiMocks.adminCreateTicketType).toHaveBeenCalledWith('event-1', 'session-1', {
      name: '看台',
      salePrice: 188,
      totalQty: 10,
      orderLimit: 2,
      accountLimit: 3,
      saleStartAt: '2026-05-01T10:00',
      saleEndAt: '2026-05-02T10:00',
    })
    expect(onSaved).toHaveBeenCalled()

    harness.cleanup()
  })

  it('adjusts ticket inventory with a non-zero quantity', async () => {
    const open = ref(true)
    const onOpenChange = vi.fn((value: boolean) => {
      open.value = value
    })
    const onSaved = vi.fn()
    const harness = setupComposable(() =>
      useInventoryAdjustDialog({
        eventId: 'event-1',
        open,
        ticketType: createTicketType(),
        onOpenChange,
        onSaved,
      }),
    )

    await harness.result.handleAdjustInventory()
    expect(toastMocks.error).toHaveBeenCalledWith('请输入非 0 的调整数量')

    harness.result.adjustQty.value = 5
    await harness.result.handleAdjustInventory()

    expect(eventApiMocks.adminAdjustTicketTypeInventory).toHaveBeenCalledWith(
      'event-1',
      'ticket-1',
      {
        adjustQty: 5,
      },
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onSaved).toHaveBeenCalled()

    harness.cleanup()
  })

  it('adds only newly selected participants', async () => {
    const eventParticipants = ref([createEventParticipant('p1')])
    const onUpdated = vi.fn()
    const harness = setupComposable(() =>
      useEventParticipantsTab({
        eventId: 'event-1',
        eventParticipants,
        onUpdated,
      }),
    )

    harness.result.openParticipantDialog()
    expect(harness.result.selectedParticipantIds.value).toEqual(['p1'])

    harness.result.toggleParticipant('p2')
    await harness.result.handleAddParticipants()

    expect(eventApiMocks.adminBatchAddParticipants).toHaveBeenCalledWith('event-1', {
      participantIds: ['p2'],
    })
    expect(harness.result.showParticipantDialog.value).toBe(false)
    expect(onUpdated).toHaveBeenCalled()

    harness.cleanup()
  })

  it('saves selected services after removing existing services', async () => {
    const eventServices = ref([createEventService()])
    const onUpdated = vi.fn()
    const harness = setupComposable(() =>
      useEventServicesTab({
        eventId: 'event-1',
        eventServices,
        onUpdated,
      }),
    )

    harness.result.openServiceDialog()
    harness.result.toggleService(createService())

    await harness.result.handleSaveServices()

    expect(eventApiMocks.adminDeleteEventService).toHaveBeenCalledWith('event-1', 'event-service-1')
    expect(eventApiMocks.adminBatchAddServices).toHaveBeenCalledWith('event-1', {
      services: [
        {
          serviceGuaranteeId: 'service-1',
          serviceGuaranteeOptionId: 'option-1',
        },
        {
          serviceGuaranteeId: 'service-2',
          serviceGuaranteeOptionId: 'option-2',
        },
      ],
    })
    expect(harness.result.showServiceDialog.value).toBe(false)
    expect(onUpdated).toHaveBeenCalled()

    harness.cleanup()
  })

  it('updates an existing event from the basic tab form', async () => {
    const onUpdated = vi.fn()
    const eventData = createEventVO()
    const harness = setupComposable(() =>
      useEventBasicTab({
        eventId: 'event-1',
        isEdit: true,
        eventData,
        onCreated: vi.fn(),
        onUpdated,
      }),
    )

    // Form should be prepopulated from eventData
    expect(harness.result.basicForm.name).toBe('已存在的演出')
    expect(harness.result.basicForm.categoryId).toBe('category-1')

    // Modify fields
    Object.assign(harness.result.basicForm, {
      name: '修改后的演出',
      recommendWeight: 20,
    })

    await harness.result.save()

    expect(eventApiMocks.updateEvent).toHaveBeenCalledWith('event-1', {
      categoryId: 'category-1',
      venueId: 'venue-1',
      cityId: 'city-1',
      name: '修改后的演出',
      coverUrl: 'cover.png',
      recommendWeight: 20,
      seriesId: undefined,
    })
    expect(onUpdated).toHaveBeenCalled()
    expect(toastMocks.success).toHaveBeenCalled()

    harness.cleanup()
  })

  it('prepopulates form fields when eventData is provided in edit mode', async () => {
    const eventData = createEventVO({
      name: '预填充演出',
      categoryId: 'category-2',
      venueId: 'venue-2',
      cityId: 'city-2',
      recommendWeight: 8,
      seriesId: 'series-1',
    })
    const harness = setupComposable(() =>
      useEventBasicTab({
        eventId: 'event-2',
        isEdit: true,
        eventData,
        onCreated: vi.fn(),
        onUpdated: vi.fn(),
      }),
    )

    expect(harness.result.basicForm.name).toBe('预填充演出')
    expect(harness.result.basicForm.categoryId).toBe('category-2')
    expect(harness.result.basicForm.venueId).toBe('venue-2')
    expect(harness.result.basicForm.cityId).toBe('city-2')
    expect(harness.result.basicForm.recommendWeight).toBe(8)
    expect(harness.result.basicForm.seriesId).toBe('series-1')

    harness.cleanup()
  })

  it('updates an existing ticket type', async () => {
    const onSaved = vi.fn()
    const editingTicketType = createTicketType()
    const harness = setupComposable(() =>
      useTicketTypeDialog({
        eventId: 'event-1',
        sessionId: null,
        editingTicketType,
        onOpenChange: vi.fn(),
        onSaved,
      }),
    )

    // Form should be prepopulated from editingTicketType
    expect(harness.result.form.name).toBe('看台')

    // Modify fields
    Object.assign(harness.result.form, {
      name: 'VIP座',
      salePrice: 388,
      orderLimit: 4,
      accountLimit: 6,
      saleStartAt: '2026-06-01T10:00',
      saleEndAt: '2026-06-02T10:00',
    })

    await harness.result.handleSaveTicketType()

    expect(eventApiMocks.adminUpdateTicketType).toHaveBeenCalledWith('event-1', 'ticket-1', {
      name: 'VIP座',
      salePrice: 388,
      orderLimit: 4,
      accountLimit: 6,
      saleStartAt: '2026-06-01T10:00',
      saleEndAt: '2026-06-02T10:00',
    })
    expect(onSaved).toHaveBeenCalled()
    expect(toastMocks.success).toHaveBeenCalled()

    harness.cleanup()
  })

  it('deletes a ticket type via the sessions tab', async () => {
    const onUpdated = vi.fn()
    const harness = setupComposable(() =>
      useSessionsAndTicketsTab({
        eventId: 'event-1',
        onUpdated,
      }),
    )

    const ticketType = createTicketType()
    harness.result.handleDeleteTicketType(ticketType)

    // Confirm dialog should be open
    expect(harness.result.confirmDialog.value.open).toBe(true)

    // Trigger confirm
    await harness.result.handleConfirm()

    expect(eventApiMocks.adminDeleteTicketType).toHaveBeenCalledWith('event-1', 'ticket-1')
    expect(toastMocks.success).toHaveBeenCalled()
    expect(harness.result.confirmDialog.value.open).toBe(false)
    expect(onUpdated).toHaveBeenCalled()

    harness.cleanup()
  })

  it('opens create ticket type dialog via useSessionsAndTicketsTab', () => {
    const onUpdated = vi.fn()
    const harness = setupComposable(() =>
      useSessionsAndTicketsTab({
        eventId: 'event-1',
        onUpdated,
      }),
    )

    harness.result.handleCreateTicketType('session-1')

    expect(harness.result.activeSessionId.value).toBe('session-1')
    expect(harness.result.editingTicketType.value).toBeNull()
    expect(harness.result.showTicketTypeDialog.value).toBe(true)

    harness.cleanup()
  })

  it('calls deleteEvent mutation and invalidates cache', async () => {
    const harness = setupComposable(() => {
      const queryClient = useQueryClient()
      const mutation = useMutation({
        mutationFn: (id: string) => eventApiMocks.deleteEvent(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('events') })
        },
      })
      return { mutation }
    })

    await harness.result.mutation.mutateAsync('event-1')

    expect(eventApiMocks.deleteEvent).toHaveBeenCalledWith('event-1')

    harness.cleanup()
  })
})
