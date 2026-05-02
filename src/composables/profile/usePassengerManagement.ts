import { usePassengerList } from './usePassengerList'
import { usePassengerForm } from './usePassengerForm'
import { usePassengerDelete } from './usePassengerDelete'
import type { QueryEnabledOptions } from '@/composables/common'

export const usePassengerManagement = (options: QueryEnabledOptions = {}) => {
  const { refreshPassengerList: _, ...listState } = usePassengerList(options)
  const formState = usePassengerForm()
  const { deletingPassengerId: __, ...deleteState } = usePassengerDelete({
    errorRef: formState.passengerError,
  })

  return {
    ...listState,
    ...formState,
    ...deleteState,
  }
}
