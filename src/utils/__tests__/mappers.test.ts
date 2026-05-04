import { describe, expect, it } from 'vitest'
import type { PassengerVO } from '@/api/account'
import type { EventVO, CategoryVO } from '@/api/event'
import {
  mapPassengerToPassengerItem,
  convertEventVOToCardItem,
  convertCategoryVOToHomeItem,
} from '../mappers'

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockPassenger = (overrides?: Partial<PassengerVO>): PassengerVO => ({
  id: 'passenger-1',
  userId: 'user-1',
  name: '张三',
  idType: 1,
  idTypeLabel: '身份证',
  idNoMasked: '110101****1234',
  ...overrides,
})

const mockEvent = (overrides?: Partial<EventVO>): EventVO => ({
  id: 'event-1',
  categoryId: 'cat-1',
  venueId: 'venue-1',
  cityId: 'city-1',
  name: '周杰伦演唱会',
  coverUrl: 'https://example.com/cover.jpg',
  status: 1,
  statusLabel: '售票中',
  categoryNameSnapshot: '演唱会',
  venueNameSnapshot: '北京国家体育场',
  firstSessionStartAt: '2026-05-15T14:30:00',
  minPrice: 19900,
  ...overrides,
})

const mockCategory = (overrides?: Partial<CategoryVO>): CategoryVO => ({
  id: 'cat-1',
  parentId: 'root',
  name: '演唱会',
  sortOrder: 1,
  ...overrides,
})

// ─── mapPassengerToPassengerItem ─────────────────────────────────────────────

describe('mapPassengerToPassengerItem', () => {
  it('maps all fields correctly from PassengerVO to PassengerItem', () => {
    const input = mockPassenger({
      id: 'p-001',
      name: '李四',
      idTypeLabel: '护照',
      idNoMasked: 'E1234****',
    })

    const result = mapPassengerToPassengerItem(input)

    expect(result).toEqual({
      id: 'p-001',
      name: '李四',
      certType: '护照',
      certNo: 'E1234****',
    })
  })

  it('maps idTypeLabel to certType even when empty string', () => {
    const input = mockPassenger({
      idTypeLabel: '',
      idNoMasked: '3205****7890',
    })

    const result = mapPassengerToPassengerItem(input)

    expect(result.certType).toBe('')
    expect(result.certNo).toBe('3205****7890')
  })

  it('preserves idNoMasked into certNo field', () => {
    const input = mockPassenger({
      idNoMasked: '4403****5678',
    })

    const result = mapPassengerToPassengerItem(input)

    expect(result.certNo).toBe('4403****5678')
  })
})

// ─── convertEventVOToCardItem ────────────────────────────────────────────────

describe('convertEventVOToCardItem', () => {
  it('converts full event data to card item correctly', () => {
    const input = mockEvent({
      id: 'evt-100',
      name: '五月天演唱会',
      coverUrl: 'https://img.example.com/mayday.jpg',
      venueNameSnapshot: '上海梅赛德斯奔驰文化中心',
      firstSessionStartAt: '2026-06-20T19:00:00',
      minPrice: 29900,
      statusLabel: '售票中',
      categoryNameSnapshot: '演唱会',
    })

    const result = convertEventVOToCardItem(input)

    expect(result).toMatchObject({
      id: 'evt-100',
      seriesName: '五月天演唱会',
      eventName: '五月天演唱会',
      coverImageUrl: 'https://img.example.com/mayday.jpg',
      venueName: '上海梅赛德斯奔驰文化中心',
      saleStatus: '售票中',
      categoryName: '演唱会',
    })
    // priceText: formatPrice(29900) → '¥299.00\u00A0元'
    expect(result.priceText).toBe('¥299.00\u00A0元')
    // dateText: formatDateTimeWithWeekday('2026-06-20T19:00:00') → '2026.6.20 周六 19:00'
    expect(result.dateText).toMatch(/^2026\.6\.20/)
  })

  it('falls back venueName to empty string when venueNameSnapshot is undefined', () => {
    const input = mockEvent({ venueNameSnapshot: undefined, id: 'evt-200' })

    const result = convertEventVOToCardItem(input)

    expect(result.venueName).toBe('')
  })

  it('falls back dateText to empty string when firstSessionStartAt is undefined', () => {
    const input = mockEvent({ firstSessionStartAt: undefined, id: 'evt-300' })

    const result = convertEventVOToCardItem(input)

    expect(result.dateText).toBe('')
  })

  it('falls back priceText to empty string when minPrice is undefined', () => {
    const input = mockEvent({ minPrice: undefined, id: 'evt-400' })

    const result = convertEventVOToCardItem(input)

    expect(result.priceText).toBe('')
  })

  it('falls back categoryName to empty string when categoryNameSnapshot is undefined', () => {
    const input = mockEvent({ categoryNameSnapshot: undefined, id: 'evt-500' })

    const result = convertEventVOToCardItem(input)

    expect(result.categoryName).toBe('')
  })

  it('handles partial optional data: only required fields present', () => {
    const input = mockEvent({
      id: 'evt-600',
      venueNameSnapshot: undefined,
      firstSessionStartAt: undefined,
      minPrice: undefined,
      statusLabel: undefined,
      categoryNameSnapshot: undefined,
    })

    const result = convertEventVOToCardItem(input)

    expect(result).toMatchObject({
      id: 'evt-600',
      venueName: '',
      dateText: '',
      priceText: '',
      categoryName: '',
      saleStatus: undefined,
    })
  })
})

// ─── convertCategoryVOToHomeItem ─────────────────────────────────────────────

describe('convertCategoryVOToHomeItem', () => {
  it('maps known category 演唱会 to Music icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-1', name: '演唱会' }))
    expect(result.icon).toBe('Music')
    expect(result.name).toBe('演唱会')
  })

  it('maps known category 话剧歌剧 to Clapperboard icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-2', name: '话剧歌剧' }))
    expect(result.icon).toBe('Clapperboard')
  })

  it('maps known category 体育 to Trophy icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-3', name: '体育' }))
    expect(result.icon).toBe('Trophy')
  })

  it('maps known category 儿童亲子 to Baby icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-4', name: '儿童亲子' }))
    expect(result.icon).toBe('Baby')
  })

  it('maps known category 展览休闲 to Landmark icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-5', name: '展览休闲' }))
    expect(result.icon).toBe('Landmark')
  })

  it('maps known category 音乐会 to Piano icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-6', name: '音乐会' }))
    expect(result.icon).toBe('Piano')
  })

  it('maps known category 曲苑杂坛 to Mic icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-7', name: '曲苑杂坛' }))
    expect(result.icon).toBe('Mic')
  })

  it('maps known category 舞蹈芭蕾 to PersonStanding icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-8', name: '舞蹈芭蕾' }))
    expect(result.icon).toBe('PersonStanding')
  })

  it('maps known category 二次元 to Gamepad2 icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-9', name: '二次元' }))
    expect(result.icon).toBe('Gamepad2')
  })

  it('maps known category 旅游展览 to Compass icon', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-10', name: '旅游展览' }))
    expect(result.icon).toBe('Compass')
  })

  it('falls back icon to Ticket for unknown category name', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'c-99', name: '未知分类' }))
    expect(result.icon).toBe('Ticket')
  })

  it('generates correct linkUrl from category id', () => {
    const result = convertCategoryVOToHomeItem(mockCategory({ id: 'cat-888', name: '体育' }))
    expect(result.linkUrl).toBe('/category?categoryId=cat-888')
  })
})
