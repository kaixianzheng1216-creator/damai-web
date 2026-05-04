import { computed, shallowRef } from 'vue'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import dayjs from 'dayjs'
import { useDialog } from '@/composables/common'

interface UseEventSearchDateDialogOptions {
  getCurrentDate: () => string | undefined
  onConfirm: (date: string) => void | Promise<void>
}

export const formatCalendarDate = (date: CalendarDate) =>
  dayjs(`${date.year}-${date.month}-${date.day}`).format('YYYY-MM-DD')

export const parseCalendarDate = (date: string | undefined) => {
  if (!date) return undefined
  const d = dayjs(date, 'YYYY-MM-DD')
  if (!d.isValid()) return undefined
  return new CalendarDate(d.year(), d.month() + 1, d.date())
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
