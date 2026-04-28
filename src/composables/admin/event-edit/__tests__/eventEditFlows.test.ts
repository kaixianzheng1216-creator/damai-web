import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, ref, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type {
  EventParticipantVO,
  EventServiceGuaranteeVO,
  ServiceGuaranteeVO,
  TicketTypeVO,
} from '@/api/event'
import { TICKET_TYPE_STATUS } from '@/constants'
import { useEventBasicTab } from '../useEventBasicTab'
import { useEventParticipantsTab } from '../useEventParticipantsTab'
import { useEventServicesTab } from '../useEventServicesTab'
import { useInventoryAdjustDialog } from '../useInventoryAdjustDialog'
import { useTicketTypeDialog } from '../useTicketTypeDialog'

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

const eventApiMocks = vi.hoisted(() => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  createTicketType: vi.fn(),
  updateTicketType: vi.fn(),
  adjustTicketTypeInventory: vi.fn(),
  batchAddParticipants: vi.fn(),
  removeParticipant: vi.fn(),
  batchAddServices: vi.fn(),
  removeService: vi.fn(),
}))

const optionApiMocks = vi.hoisted(() => ({
  fetchAdminCities: vi.fn(),
  fetchAdminCategories: vi.fn(),
  fetchAdminVenues: vi.fn(),
  fetchAdminSeries: vi.fn(),
  fetchAdminParticipantsPage: vi.fn(),
  fetchAdminServices: vi.fn(),
}))

vi.mock('vue3-toastify', () => ({
  toast: toastMocks,
}))

vi.mock('@/api/event/event', () => eventApiMocks)
vi.mock('@/api/event/city', () => ({ fetchAdminCities: optionApiMocks.fetchAdminCities }))
vi.mock('@/api/event/category', () => ({
  fetchAdminCategories: optionApiMocks.fetchAdminCategories,
}))
vi.mock('@/api/event/venue', () => ({ fetchAdminVenues: optionApiMocks.fetchAdminVenues }))
vi.mock('@/api/event/series', () => ({ fetchAdminSeries: optionApiMocks.fetchAdminSeries }))
vi.mock('@/api/event/participant', () => ({
  fetchAdminParticipantsPage: optionApiMocks.fetchAdminParticipantsPage,
}))
vi.mock('@/api/event/service', () => ({
  fetchAdminServices: optionApiMocks.fetchAdminServices,
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

beforeEach(() => {
  eventApiMocks.createEvent.mockResolvedValue('event-new')
  eventApiMocks.updateEvent.mockResolvedValue(undefined)
  eventApiMocks.createTicketType.mockResolvedValue(undefined)
  eventApiMocks.updateTicketType.mockResolvedValue(undefined)
  eventApiMocks.adjustTicketTypeInventory.mockResolvedValue(undefined)
  eventApiMocks.batchAddParticipants.mockResolvedValue(undefined)
  eventApiMocks.removeParticipant.mockResolvedValue(undefined)
  eventApiMocks.batchAddServices.mockResolvedValue(undefined)
  eventApiMocks.removeService.mockResolvedValue(undefined)

  optionApiMocks.fetchAdminCities.mockResolvedValue([])
  optionApiMocks.fetchAdminCategories.mockResolvedValue([])
  optionApiMocks.fetchAdminVenues.mockResolvedValue([])
  optionApiMocks.fetchAdminSeries.mockResolvedValue([])
  optionApiMocks.fetchAdminParticipantsPage.mockResolvedValue({
    pageNumber: 1,
    pageSize: 10,
    totalRow: 0,
    totalPage: 1,
    records: [],
  })
  optionApiMocks.fetchAdminServices.mockResolvedValue([])
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
    expect(toastMocks.error).toHaveBeenCalledWith('请填写完整信息')
    expect(eventApiMocks.createTicketType).not.toHaveBeenCalled()

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

    expect(eventApiMocks.createTicketType).toHaveBeenCalledWith('event-1', 'session-1', {
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
    expect(toastMocks.error).toHaveBeenCalledWith('请输入调整数量')

    harness.result.adjustQty.value = 5
    await harness.result.handleAdjustInventory()

    expect(eventApiMocks.adjustTicketTypeInventory).toHaveBeenCalledWith('event-1', 'ticket-1', {
      adjustQty: 5,
    })
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

    expect(eventApiMocks.batchAddParticipants).toHaveBeenCalledWith('event-1', {
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

    expect(eventApiMocks.removeService).toHaveBeenCalledWith('event-1', 'event-service-1')
    expect(eventApiMocks.batchAddServices).toHaveBeenCalledWith('event-1', {
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
})
