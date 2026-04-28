import { CalendarDate } from '@internationalized/date'
import { describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import {
  formatCalendarDate,
  parseCalendarDate,
  useEventSearchDateDialog,
} from '../useEventSearchDateDialog'

describe('useEventSearchDateDialog', () => {
  it('parses and formats calendar dates', () => {
    const date = parseCalendarDate('2026-04-08')

    expect(date).toBeInstanceOf(CalendarDate)
    expect(date ? formatCalendarDate(date) : '').toBe('2026-04-08')
    expect(parseCalendarDate(undefined)).toBeUndefined()
    expect(parseCalendarDate('bad-date')).toBeUndefined()
  })

  it('opens with the current URL date and confirms one formatted date', async () => {
    const onConfirm = vi.fn()
    const scope = effectScope()
    const result = scope.run(() =>
      useEventSearchDateDialog({
        getCurrentDate: () => '2026-05-01',
        onConfirm,
      }),
    )

    if (!result) {
      throw new Error('useEventSearchDateDialog did not initialize')
    }

    result.open()
    expect(result.isOpen.value).toBe(true)
    expect(result.selectedDate.value ? formatCalendarDate(result.selectedDate.value) : '').toBe(
      '2026-05-01',
    )

    result.selectedDate.value = new CalendarDate(2026, 5, 3)
    await result.confirm()

    expect(result.isOpen.value).toBe(false)
    expect(onConfirm).toHaveBeenCalledWith('2026-05-03')

    scope.stop()
  })
})
