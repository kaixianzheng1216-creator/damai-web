import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import {
  normalizeId,
  normalizeIdList,
  normalizeResponseFields,
  transformDateTimeFields,
} from '../requestTransforms'

describe('request transforms', () => {
  it('normalizes entity id primitives without changing non-id values', () => {
    expect(normalizeId(9007199254740992)).toBe('9007199254740992')
    expect(normalizeId(10001n)).toBe('10001')
    expect(normalizeId('10002')).toBe('10002')
    expect(normalizeId(null)).toBeNull()
  })

  it('normalizes entity id lists while preserving list order', () => {
    expect(normalizeIdList([20001, '20002', 20003n])).toEqual(['20001', '20002', '20003'])
  })

  it('converts datetime-local strings to ISO strings without mutating other values', () => {
    const result = transformDateTimeFields({
      title: '演唱会',
      startAt: '2026-04-27T19:30',
      nested: [{ endAt: '2026-04-27T21:30' }],
    })

    expect(result).toEqual({
      title: '演唱会',
      startAt: dayjs('2026-04-27T19:30').toISOString(),
      nested: [{ endAt: dayjs('2026-04-27T21:30').toISOString() }],
    })
  })

  it('normalizes paginated number fields and entity ids from API responses', () => {
    const result = normalizeResponseFields({
      pageNumber: '1',
      pageSize: '10',
      totalRow: '20',
      totalPage: '2',
      records: [
        {
          id: 9007199254740992,
          eventId: 10001,
          passengerIds: [20001, '20002'],
          status: 1,
        },
      ],
    })

    expect(result).toEqual({
      pageNumber: 1,
      pageSize: 10,
      totalRow: 20,
      totalPage: 2,
      records: [
        {
          id: '9007199254740992',
          eventId: '10001',
          passengerIds: ['20001', '20002'],
          status: 1,
        },
      ],
    })
  })
})
