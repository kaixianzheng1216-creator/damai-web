import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  fetchParticipantDetail,
  fetchParticipantEventsPage,
  followParticipant,
  unfollowParticipant,
  checkIsFollowedParticipant,
} from '@/api/event'
import { useFollowToggle } from '@/composables/common/useFollowToggle'

export function useParticipantDetailPage() {
  const route = useRoute()
  const router = useRouter()

  const participantId = computed(() => route.params.id as string)
  const currentPage = ref(1)

  const participantQuery = useQuery({
    queryKey: computed(() => ['participant-detail', participantId.value]),
    queryFn: () => fetchParticipantDetail(participantId.value),
  })

  const eventsQuery = useQuery({
    queryKey: computed(() => ['participant-events', participantId.value, currentPage.value]),
    queryFn: () =>
      fetchParticipantEventsPage(participantId.value, {
        page: currentPage.value,
        size: 10,
      }),
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
    followQueryKeyPrefix: 'participant-followed',
    entityQueryKeyPrefix: 'participant-detail',
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
