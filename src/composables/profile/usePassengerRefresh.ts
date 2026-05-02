import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/constants'

export const useRefreshPassengerList = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.passengers() })
}
