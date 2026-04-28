import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  fetchParticipantDetail,
  fetchParticipantEventsPage,
  followParticipant,
  unfollowParticipant,
  checkIsFollowedParticipant,
} from '@/api/event'
import { useFollowToggle } from '@/composables/common/useFollowToggle'
import { queryKeys } from '@/constants'

export function useParticipantDetailPage() {
  const route = useRoute()

  const participantId = computed(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) ?? ''
  })
  const hasParticipantId = computed(() => participantId.value.length > 0)
  const currentPage = ref(1)

  const participantQuery = useQuery({
    queryKey: computed(() => queryKeys.participant.detail(participantId.value)),
    queryFn: () => fetchParticipantDetail(participantId.value),
    enabled: hasParticipantId,
  })

  const eventsQuery = useQuery({
    queryKey: computed(() => queryKeys.participant.events(participantId.value, currentPage.value)),
    queryFn: () =>
      fetchParticipantEventsPage(participantId.value, {
        page: currentPage.value,
        size: 10,
      }),
    enabled: hasParticipantId,
  })

  const {
    isFollowedQuery,
    followMutation,
    unfollowMutation,
    toggleFollow,
    isFollowed,
    isFollowLoading,
  } = useFollowToggle({
    id: () => participantId.value,
    followQueryKey: queryKeys.participant.followed,
    entityQueryKey: queryKeys.participant.detail,
    checkIsFollowed: checkIsFollowedParticipant,
    follow: followParticipant,
    unfollow: unfollowParticipant,
    buildFollowRequest: (id) => ({ participantId: id }),
  })

  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  return {
    participantId,
    participantQuery,
    isFollowedQuery,
    followMutation,
    unfollowMutation,
    eventsQuery,
    currentPage,
    handlePageChange,
    toggleFollow,
    isFollowed,
    isFollowLoading,
  }
}
