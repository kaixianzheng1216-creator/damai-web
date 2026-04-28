import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import type { PassengerItem } from '@/api/account'
import type { EventDetailVO, TicketTypeVO } from '@/api/event'
import { TICKET_TYPE_STATUS } from '@/constants'
import { useEventTicketSelection } from '../useEventTicketSelection'

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
    purchaseNotice: [{ name: '购票规则', description: '每单限购' }],
    admissionNotice: [{ name: '入场规则', description: '提前入场' }],
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
      ticketTypes: [
        createTicketType({
          id: 'off-sale',
          status: TICKET_TYPE_STATUS.OFF_SALE,
        }),
        createTicketType({
          id: 'on-sale',
        }),
      ],
    },
    {
      id: 'session-2',
      name: '第二场',
      startAt: '2026-05-02T19:30:00.000Z',
      endAt: '2026-05-02T21:30:00.000Z',
      status: 1,
      statusLabel: '正常',
      ticketTypes: [createTicketType({ id: 'second-ticket', sessionId: 'session-2' })],
    },
  ],
  seriesEvents: [{ id: 'event-2', name: '同系列演出' }],
})

const passengers: PassengerItem[] = [
  { id: 'p1', name: '张三', certType: '身份证', certNo: '110***' },
  { id: 'p2', name: '李四', certType: '身份证', certNo: '120***' },
]

describe('useEventTicketSelection', () => {
  it('derives session, ticket, passenger and notice state', async () => {
    const detail = ref<EventDetailVO | undefined>(createDetail())
    const passengerList = ref<PassengerItem[]>(passengers)
    const scope = effectScope()
    const result = scope.run(() =>
      useEventTicketSelection({
        detail,
        passengers: passengerList,
      }),
    )

    if (!result) {
      throw new Error('useEventTicketSelection did not initialize')
    }

    await nextTick()

    expect(result.selectedSessionId.value).toBe('session-1')
    expect(result.selectedTicketTypeId.value).toBe('on-sale')
    expect(result.ticketTypeIds.value).toEqual(['off-sale', 'on-sale'])
    expect(result.selectedPassengerIds.value).toEqual(['p1'])
    expect(result.totalPrice.value).toBe('¥1.88')

    result.ticketQuantity.value = 2
    await nextTick()

    expect(result.selectedPassengerIds.value).toEqual(['p1', 'p2'])
    expect(result.passengerSlots.value).toEqual([
      { index: 0, label: '第 1 张票', passengerId: 'p1' },
      { index: 1, label: '第 2 张票', passengerId: 'p2' },
    ])
    expect(result.canSubmitOrder.value).toBe(true)

    result.updatePassengerForSlot(1, 'p1')
    await nextTick()

    expect(result.duplicatePassengerSelected.value).toBe(true)
    expect(result.passengerOptionDisabled('p1', 1)).toBe(true)

    result.activeTab.value = 'purchase'
    expect(result.currentNotices.value).toEqual(detail.value?.info.purchaseNotice)

    result.selectedSessionId.value = 'session-2'
    await nextTick()

    expect(result.selectedTicketTypeId.value).toBe('second-ticket')
    expect(result.seriesEvents.value).toEqual([{ id: 'event-2', name: '同系列演出' }])

    scope.stop()
  })
})
