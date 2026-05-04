import { describe, expect, it } from 'vitest'
import {
  formatPrice,
  formatPriceRange,
  formatDateTimeWithWeekday,
  formatDateTime,
  formatDateTimeLocalInput,
  formatDate,
  formatDateTimeRange,
} from '../format'

// ---------------------------------------------------------------------------
// formatPrice
// ---------------------------------------------------------------------------
describe('formatPrice', () => {
  it('converts 0 cents to ¥0.00', () => {
    expect(formatPrice(0)).toBe('¥0.00\u00A0元')
  })

  it('converts whole-yuan amounts correctly', () => {
    expect(formatPrice(19900)).toBe('¥199.00\u00A0元')
  })

  it('converts single cent to ¥0.01', () => {
    expect(formatPrice(1)).toBe('¥0.01\u00A0元')
  })

  it('handles negative prices', () => {
    expect(formatPrice(-500)).toBe('-¥5.00\u00A0元')
  })

  it('handles large amounts with rounding', () => {
    expect(formatPrice(123456)).toBe('¥1,234.56\u00A0元')
  })
})

// ---------------------------------------------------------------------------
// formatPriceRange
// ---------------------------------------------------------------------------
describe('formatPriceRange', () => {
  it('returns single price when min equals max', () => {
    expect(formatPriceRange(19900, 19900)).toBe('¥199.00\u00A0元')
  })

  it('returns single ¥0.00 when both prices are zero', () => {
    expect(formatPriceRange(0, 0)).toBe('¥0.00\u00A0元')
  })

  it('returns range with em-dash separator when prices differ', () => {
    expect(formatPriceRange(100, 19900)).toBe('¥1.00\u00A0元 — ¥199.00\u00A0元')
  })

  it('handles negative min with positive max', () => {
    expect(formatPriceRange(-100, 500)).toBe('-¥1.00\u00A0元 — ¥5.00\u00A0元')
  })
})

// ---------------------------------------------------------------------------
// formatDateTimeWithWeekday
// ---------------------------------------------------------------------------
describe('formatDateTimeWithWeekday', () => {
  it('formats valid date with Chinese weekday and time', () => {
    // 2026-06-15 is a Monday (周一)
    expect(formatDateTimeWithWeekday('2026-06-15T14:30:00')).toBe('2026.6.15 周一 14:30')
  })

  it('returns empty string for null', () => {
    expect(formatDateTimeWithWeekday(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDateTimeWithWeekday(undefined)).toBe('')
  })

  it('handles Date object input', () => {
    const result = formatDateTimeWithWeekday(new Date('2026-06-15T14:30:00'))
    expect(result).toContain('2026.6.15')
    expect(result).toContain('14:30')
    expect(result).toContain('周一')
  })
})

// ---------------------------------------------------------------------------
// formatDateTime
// ---------------------------------------------------------------------------
describe('formatDateTime', () => {
  it('formats valid date as YYYY.M.D HH:mm', () => {
    expect(formatDateTime('2026-06-15T14:30:00')).toBe('2026.6.15 14:30')
  })

  it('returns default empty string for null', () => {
    expect(formatDateTime(null)).toBe('')
  })

  it('returns custom fallback string when provided', () => {
    expect(formatDateTime(null, '待定')).toBe('待定')
  })

  it('returns custom fallback for undefined dateTime', () => {
    expect(formatDateTime(undefined, '未定')).toBe('未定')
  })
})

// ---------------------------------------------------------------------------
// formatDateTimeLocalInput
// ---------------------------------------------------------------------------
describe('formatDateTimeLocalInput', () => {
  it('formats valid date for datetime-local input', () => {
    expect(formatDateTimeLocalInput('2026-06-15T14:30:00')).toBe('2026-06-15T14:30')
  })

  it('returns empty string for null', () => {
    expect(formatDateTimeLocalInput(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDateTimeLocalInput(undefined)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats valid date as YYYY.M.D without time', () => {
    expect(formatDate('2026-06-15T14:30:00')).toBe('2026.6.15')
  })

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('handles date-only string without time component', () => {
    expect(formatDate('2026-12-31')).toBe('2026.12.31')
  })
})

// ---------------------------------------------------------------------------
// formatDateTimeRange
// ---------------------------------------------------------------------------
describe('formatDateTimeRange', () => {
  it('shows only time range for same-day events', () => {
    expect(formatDateTimeRange('2026-06-15T14:30:00', '2026-06-15T16:00:00')).toBe(
      '2026.6.15 14:30 — 16:00',
    )
  })

  it('shows full datetime range for different-day events', () => {
    expect(formatDateTimeRange('2026-06-15T14:30:00', '2026-06-16T10:00:00')).toBe(
      '2026.6.15 14:30 — 2026.6.16 10:00',
    )
  })

  it('returns empty string when start is null', () => {
    expect(formatDateTimeRange(null, '2026-06-15T16:00:00')).toBe('')
  })

  it('returns start only when end is null', () => {
    expect(formatDateTimeRange('2026-06-15T14:30:00', null)).toBe('2026.6.15 14:30')
  })

  it('returns start only when end is undefined', () => {
    expect(formatDateTimeRange('2026-06-15T14:30:00', undefined)).toBe('2026.6.15 14:30')
  })
})
