import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchFollowedEventsPage,
  fetchFollowedParticipantsPage,
  unfollowEvent,
  unfollowParticipant,
} from '@/api/event'
import { useUserStore } from '@/stores/user'
import { usePagination } from '@/composables/common/usePagination'

export function useFollowList() {
  const userStore = useUserStore()
  const queryClient = useQueryClient()

  const eventsPagination = usePagination()
  const participantsPagination = usePagination()

  const followedEventsQuery = useQuery({
    queryKey: computed(() => [
      'followed-events',
      eventsPagination.page.value,
      eventsPagination.pageSize.value,
    ]),
    queryFn: () => fetchFollowedEventsPage(eventsPagination.getPaginationParams()),
    enabled: computed(() => userStore.isLoggedIn),
  })

  const followedParticipantsQuery = useQuery({
    queryKey: computed(() => [
      'followed-participants',
      participantsPagination.page.value,
      participantsPagination.pageSize.value,
    ]),
    queryFn: () => fetchFollowedParticipantsPage(participantsPagination.getPaginationParams()),
    enabled: computed(() => userStore.isLoggedIn),
  })

  const unfollowEventMutation = useMutation({
    mutationFn: unfollowEvent,
    onSuccess: (_data, eventId) => {
      // Optimize: directly update cache data instead of just invalidating
      queryClient.setQueriesData({ queryKey: ['followed-events'] }, (oldData: any) => {
        if (!oldData?.records) return oldData
        return {
          ...oldData,
          records: oldData.records.filter((item: any) => item.eventId !== eventId),
          totalRow: oldData.totalRow ? oldData.totalRow - 1 : undefined,
        }
      })
    },
  })

  const unfollowParticipantMutation = useMutation({
    mutationFn: unfollowParticipant,
    onSuccess: (_data, participantId) => {
      // Optimize: directly update cache data instead of just invalidating
      queryClient.setQueriesData({ queryKey: ['followed-participants'] }, (oldData: any) => {
        if (!oldData?.records) return oldData
        return {
          ...oldData,
          records: oldData.records.filter((item: any) => item.participantId !== participantId),
          totalRow: oldData.totalRow ? oldData.totalRow - 1 : undefined,
        }
      })
    },
  })

  const paginatedFollowedEvents = eventsPagination.getRecords(followedEventsQuery.data)
  const followedEventsTotalPages = eventsPagination.getTotalPages(followedEventsQuery.data)
  const followedEventsTotalRow = eventsPagination.getTotalRow(followedEventsQuery.data)

  const paginatedFollowedParticipants = participantsPagination.getRecords(
    followedParticipantsQuery.data,
  )
  const followedParticipantsTotalPages = participantsPagination.getTotalPages(
    followedParticipantsQuery.data,
  )
  const followedParticipantsTotalRow = participantsPagination.getTotalRow(
    followedParticipantsQuery.data,
  )

  const handleUnfollowEvent = async (eventId: string) => {
    await unfollowEventMutation.mutateAsync(eventId)
  }

  const handleUnfollowParticipant = async (participantId: string) => {
    await unfollowParticipantMutation.mutateAsync(participantId)
  }

  return {
    followedEventsPage: eventsPagination.page,
    followedEventsPageSize: eventsPagination.pageSize,
    followedEventsQuery,
    paginatedFollowedEvents,
    followedEventsTotalPages,
    followedEventsTotalRow,
    updateFollowedEventsPage: eventsPagination.updatePage,
    updateFollowedEventsPageSize: eventsPagination.updatePageSize,
    handleUnfollowEvent,

    followedParticipantsPage: participantsPagination.page,
    followedParticipantsPageSize: participantsPagination.pageSize,
    followedParticipantsQuery,
    paginatedFollowedParticipants,
    followedParticipantsTotalPages,
    followedParticipantsTotalRow,
    updateFollowedParticipantsPage: participantsPagination.updatePage,
    updateFollowedParticipantsPageSize: participantsPagination.updatePageSize,
    handleUnfollowParticipant,
  }
}
