import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import type { PassengerItem } from '@/api/account'
import type { EventDetailVO, TicketTypeVO } from '@/api/event'
import { TICKET_TYPE_STATUS } from '@/constants'
import {
  buildPassengerSelection,
  calculateMaxTicketQuantity,
  getCurrentNotices,
  getSelectedPassengers,
  getUserPurchasedCount,
  isTicketTypeOnSale,
  resolveSelectedTicketTypeId,
} from '../eventDetailState'

const createTicketType = (overrides: Partial<TicketTypeVO> = {}): TicketTypeVO => ({
  id: 'ticket-1',
  sessionId: 'session-1',
  name: '看台',
  salePrice: 188,
  orderLimit: 4,
  accountLimit: 3,
  status: TICKET_TYPE_STATUS.ON_SALE,
  statusLabel: '销售中',
  saleStartAt: '2026-04-01T00:00:00.000Z',
  saleEndAt: '2026-05-01T00:00:00.000Z',
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
  sessions: [],
  seriesEvents: [],
})

const passengers: PassengerItem[] = [
  { id: 'p1', name: '张三', certType: '身份证', certNo: '110***' },
  { id: 'p2', name: '李四', certType: '身份证', certNo: '120***' },
]

describe('eventDetailState', () => {
  it('checks sale windows and resolves the selected ticket type', () => {
    const now = dayjs('2026-04-28T12:00:00.000Z')
    const onSale = createTicketType({ id: 'on-sale' })
    const offSale = createTicketType({
      id: 'off-sale',
      status: TICKET_TYPE_STATUS.OFF_SALE,
    })

    expect(isTicketTypeOnSale(onSale, now)).toBe(true)
    expect(isTicketTypeOnSale(offSale, now)).toBe(false)
    expect(resolveSelectedTicketTypeId([offSale, onSale], null)).toBe('on-sale')
    expect(resolveSelectedTicketTypeId([onSale], 'on-sale')).toBe('on-sale')
  })

  it('fills passenger selection without duplicates and derives selected passengers', () => {
    expect(buildPassengerSelection(['p1', 'p1'], passengers, 2)).toEqual(['p1', 'p2'])
    expect(getSelectedPassengers(['p1', 'missing'], passengers)).toEqual([passengers[0]])
  })

  it('calculates max ticket quantity from order, inventory and account limits', () => {
    const ticketType = createTicketType({
      orderLimit: 4,
      accountLimit: 3,
      inventory: {
        ticketTypeId: 'ticket-1',
        totalQty: 10,
        lockedQty: 2,
        soldQty: 5,
      },
    })

    expect(calculateMaxTicketQuantity({ ticketType, userPurchasedCount: 1 })).toBe(2)
    expect(calculateMaxTicketQuantity({ ticketType, userPurchasedCount: 3 })).toBe(1)
    expect(getUserPurchasedCount('ticket-1', { 'ticket-1': 2 })).toBe(2)
    expect(getUserPurchasedCount(undefined, { 'ticket-1': 2 })).toBe(0)
  })

  it('returns notices by active detail tab', () => {
    const detail = createDetail()

    expect(getCurrentNotices(detail, 'detail')).toEqual([])
    expect(getCurrentNotices(detail, 'purchase')).toEqual(detail.info.purchaseNotice)
    expect(getCurrentNotices(detail, 'watch')).toEqual(detail.info.admissionNotice)
  })
})
