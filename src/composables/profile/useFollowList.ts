import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchFollowedEventsPage,
  fetchFollowedParticipantsPage,
  unfollowEvent,
  unfollowParticipant,
} from '@/api/event'
import { useUserStore } from '@/stores/user'
import { queryKeys } from '@/constants'
import { usePagination } from '@/composables/common/usePagination'
import { useQueryEnabled, type QueryEnabledOptions } from '@/composables/common/useQueryEnabled'
import type {
  PageResponseUserFollowEventVO,
  PageResponseUserFollowParticipantVO,
} from '@/api/event'

interface FollowListOptions {
  events?: QueryEnabledOptions
  participants?: QueryEnabledOptions
}

export function useFollowList(options: FollowListOptions = {}) {
  const userStore = useUserStore()
  const queryClient = useQueryClient()
  const eventSectionEnabled = useQueryEnabled(options.events?.enabled)
  const participantSectionEnabled = useQueryEnabled(options.participants?.enabled)
  const eventsEnabled = computed(() => userStore.isLoggedIn && eventSectionEnabled.value)
  const participantsEnabled = computed(
    () => userStore.isLoggedIn && participantSectionEnabled.value,
  )

  const eventsPagination = usePagination()
  const participantsPagination = usePagination()

  const followedEventsQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.profile.followedEvents(
        eventsPagination.page.value,
        eventsPagination.pageSize.value,
      ),
    ),
    queryFn: () => fetchFollowedEventsPage(eventsPagination.getPaginationParams()),
    enabled: eventsEnabled,
  })

  const followedParticipantsQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.profile.followedParticipants(
        participantsPagination.page.value,
        participantsPagination.pageSize.value,
      ),
    ),
    queryFn: () => fetchFollowedParticipantsPage(participantsPagination.getPaginationParams()),
    enabled: participantsEnabled,
  })

  const unfollowEventMutation = useMutation({
    mutationFn: unfollowEvent,
    onSuccess: (_data, eventId) => {
      queryClient.setQueriesData<PageResponseUserFollowEventVO>(
        { queryKey: queryKeys.profile.followedEvents() },
        (oldData) => {
          if (!oldData?.records) return oldData
          return {
            ...oldData,
            records: oldData.records.filter((item) => item.eventId !== eventId),
            totalRow: Math.max(0, oldData.totalRow - 1),
          }
        },
      )
    },
  })

  const unfollowParticipantMutation = useMutation({
    mutationFn: unfollowParticipant,
    onSuccess: (_data, participantId) => {
      queryClient.setQueriesData<PageResponseUserFollowParticipantVO>(
        { queryKey: queryKeys.profile.followedParticipants() },
        (oldData) => {
          if (!oldData?.records) return oldData
          return {
            ...oldData,
            records: oldData.records.filter((item) => item.participantId !== participantId),
            totalRow: Math.max(0, oldData.totalRow - 1),
          }
        },
      )
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
