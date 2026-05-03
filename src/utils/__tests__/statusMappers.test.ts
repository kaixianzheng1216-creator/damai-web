import { describe, expect, it } from 'vitest'
import {
  getOrderStatusBadgeClass,
  getTicketStatusClass,
  getWorkOrderStatusBadgeClass,
  mapOrderStatus,
} from '../statusMappers'
import { ORDER_STATUS, TICKET_STATUS, WORK_ORDER_STATUS } from '@/constants'

describe('mapOrderStatus', () => {
  it('maps PENDING to 待付款', () => {
    expect(mapOrderStatus(ORDER_STATUS.PENDING)).toBe('待付款')
  })

  it('maps PAID to 已支付', () => {
    expect(mapOrderStatus(ORDER_STATUS.PAID)).toBe('已支付')
  })

  it('maps CANCELLED to 已取消', () => {
    expect(mapOrderStatus(ORDER_STATUS.CANCELLED)).toBe('已取消')
  })

  it('maps CLOSED to CANCELLED label (已取消)', () => {
    expect(mapOrderStatus(ORDER_STATUS.CLOSED)).toBe('已取消')
  })

  it('maps REFUNDED to 已退款', () => {
    expect(mapOrderStatus(ORDER_STATUS.REFUNDED)).toBe('已退款')
  })

  it('maps unknown status to default 已完成', () => {
    expect(mapOrderStatus(999)).toBe('已完成')
  })
})

describe('getTicketStatusClass', () => {
  it('returns green class for UNUSED tickets', () => {
    expect(getTicketStatusClass(TICKET_STATUS.UNUSED)).toBe(
      'bg-green-50 text-green-700 border border-green-200',
    )
  })

  it('returns gray class for USED tickets', () => {
    expect(getTicketStatusClass(TICKET_STATUS.USED)).toBe(
      'bg-gray-50 text-gray-600 border border-gray-200',
    )
  })

  it('returns red class for VOIDED tickets', () => {
    expect(getTicketStatusClass(TICKET_STATUS.VOIDED)).toBe(
      'bg-red-50 text-red-700 border border-red-200',
    )
  })

  it('returns orange class for REFUNDED tickets', () => {
    expect(getTicketStatusClass(TICKET_STATUS.REFUNDED)).toBe(
      'bg-orange-50 text-orange-700 border border-orange-200',
    )
  })

  it('returns default class for unknown ticket status', () => {
    expect(getTicketStatusClass(999)).toBe('bg-transparent text-foreground border border-border')
  })
})

describe('getOrderStatusBadgeClass', () => {
  it('returns orange class for PENDING orders', () => {
    expect(getOrderStatusBadgeClass(ORDER_STATUS.PENDING)).toBe(
      'bg-orange-50 text-orange-700 border border-orange-200',
    )
  })

  it('returns green class for PAID orders', () => {
    expect(getOrderStatusBadgeClass(ORDER_STATUS.PAID)).toBe(
      'bg-green-50 text-green-700 border border-green-200',
    )
  })

  it('returns gray class for CANCELLED orders', () => {
    expect(getOrderStatusBadgeClass(ORDER_STATUS.CANCELLED)).toBe(
      'bg-gray-50 text-gray-600 border border-gray-200',
    )
  })

  it('shares gray class for CLOSED orders (same as CANCELLED)', () => {
    expect(getOrderStatusBadgeClass(ORDER_STATUS.CLOSED)).toBe(
      'bg-gray-50 text-gray-600 border border-gray-200',
    )
  })

  it('returns blue class for REFUNDED orders', () => {
    expect(getOrderStatusBadgeClass(ORDER_STATUS.REFUNDED)).toBe(
      'bg-blue-50 text-blue-700 border border-blue-200',
    )
  })

  it('returns default class for unknown numeric status', () => {
    expect(getOrderStatusBadgeClass(999)).toBe(
      'bg-transparent text-foreground border border-border',
    )
  })

  it('accepts string status and converts via Number()', () => {
    expect(getOrderStatusBadgeClass('999')).toBe(
      'bg-transparent text-foreground border border-border',
    )
  })
})

describe('getWorkOrderStatusBadgeClass', () => {
  it('returns orange class for PENDING work orders', () => {
    expect(getWorkOrderStatusBadgeClass(WORK_ORDER_STATUS.PENDING)).toBe(
      'bg-orange-50 text-orange-700 border border-orange-200',
    )
  })

  it('returns blue class for PROCESSING work orders', () => {
    expect(getWorkOrderStatusBadgeClass(WORK_ORDER_STATUS.PROCESSING)).toBe(
      'bg-blue-50 text-blue-700 border border-blue-200',
    )
  })

  it('returns gray class for CLOSED work orders', () => {
    expect(getWorkOrderStatusBadgeClass(WORK_ORDER_STATUS.CLOSED)).toBe(
      'bg-gray-50 text-gray-600 border border-gray-200',
    )
  })

  it('returns default class for unknown numeric status', () => {
    expect(getWorkOrderStatusBadgeClass(999)).toBe(
      'bg-transparent text-foreground border border-border',
    )
  })

  it('accepts string status and converts via Number()', () => {
    expect(getWorkOrderStatusBadgeClass('999')).toBe(
      'bg-transparent text-foreground border border-border',
    )
  })
})
