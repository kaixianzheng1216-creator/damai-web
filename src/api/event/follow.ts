import { request } from '@/api/request'
import type {
  UserFollowEventRequest,
  UserFollowParticipantRequest,
  PageResponseUserFollowEventVO,
  PageResponseUserFollowParticipantVO,
} from './types'

// ─── Event Follow ─────────────────────────────────────────

export const followEvent = (data: UserFollowEventRequest): Promise<void> =>
  request.post<void>('/api/event/front/user-follows/events', data)

export const unfollowEvent = (eventId: string): Promise<void> =>
  request.del<void>(`/api/event/front/user-follows/events/${eventId}`)

export const checkIsFollowedEvent = (eventId: string): Promise<boolean> =>
  request.get<boolean>(`/api/event/front/user-follows/events/${eventId}/check`)

export const fetchFollowedEventsPage = (params?: {
  page?: number
  size?: number
}): Promise<PageResponseUserFollowEventVO> =>
  request.get<PageResponseUserFollowEventVO>('/api/event/front/user-follows/events/page', {
    params,
  })

// ─── Participant Follow ─────────────────────────────────────────

export const followParticipant = (data: UserFollowParticipantRequest): Promise<void> =>
  request.post<void>('/api/event/front/user-follows/participants', data)

export const unfollowParticipant = (participantId: string): Promise<void> =>
  request.del<void>(`/api/event/front/user-follows/participants/${participantId}`)

export const checkIsFollowedParticipant = (participantId: string): Promise<boolean> =>
  request.get<boolean>(`/api/event/front/user-follows/participants/${participantId}/check`)

export const fetchFollowedParticipantsPage = (params?: {
  page?: number
  size?: number
}): Promise<PageResponseUserFollowParticipantVO> =>
  request.get<PageResponseUserFollowParticipantVO>(
    '/api/event/front/user-follows/participants/page',
    {
      params,
    },
  )
