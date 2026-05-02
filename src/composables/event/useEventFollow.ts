import { useFollowToggle } from '@/composables/common/useFollowToggle'
import { followEvent, unfollowEvent, checkIsFollowedEvent } from '@/api/event'
import { queryKeys } from '@/constants'

export function useEventFollow(eventId: () => string) {
  return useFollowToggle({
    id: eventId,
    followQueryKey: queryKeys.event.followed,
    entityQueryKey: queryKeys.event.detail,
    checkIsFollowed: checkIsFollowedEvent,
    follow: followEvent,
    unfollow: unfollowEvent,
    buildFollowRequest: (id) => ({ eventId: id }),
  })
}
