import { computed, shallowRef } from 'vue'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import { useDialog } from '@/composables/common'

interface UseEventSearchDateDialogOptions {
  getCurrentDate: () => string | undefined
  onConfirm: (date: string) => void | Promise<void>
}

const padDatePart = (value: number) => String(value).padStart(2, '0')

export const formatCalendarDate = (date: CalendarDate) =>
  `${date.year}-${padDatePart(date.month)}-${padDatePart(date.day)}`

export const parseCalendarDate = (date: string | undefined) => {
  if (!date) {
    return undefined
  }

  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    return undefined
  }

  return new CalendarDate(year, month, day)
}

export const useEventSearchDateDialog = ({
  getCurrentDate,
  onConfirm,
}: UseEventSearchDateDialogOptions) => {
  const { open: isOpen, openDialog, closeDialog } = useDialog()
  const selectedDate = shallowRef<CalendarDate | undefined>()

  const dateModel = computed<DateValue | undefined>(
    () => selectedDate.value as unknown as DateValue | undefined,
  )

  const open = () => {
    selectedDate.value = parseCalendarDate(getCurrentDate())
    openDialog()
  }

  const confirm = async () => {
    if (!selectedDate.value) {
      return
    }

    closeDialog()
    await onConfirm(formatCalendarDate(selectedDate.value))
  }

  return {
    isOpen,
    selectedDate,
    dateModel,
    open,
    close: closeDialog,
    confirm,
  }
}
