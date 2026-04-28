import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  ParticipantVO,
  ParticipantCreateRequest,
  ParticipantUpdateRequest,
  ParticipantPageRequest,
  PageResponseParticipantVO,
  ParticipantEventPageRequest,
  PageResponseEventVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminParticipants = (): Promise<ParticipantVO[]> =>
  request.get<ParticipantVO[]>('/api/event/admin/participants')

export const fetchAdminParticipantsPage = (
  query?: ParticipantPageRequest,
): Promise<PageResponseParticipantVO> =>
  request.get<PageResponseParticipantVO>('/api/event/admin/participants/page', { params: query })

export const createParticipant = (data: ParticipantCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/participants', data).then(normalizeEntityId)

export const updateParticipant = (id: string, data: ParticipantUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/participants/${id}`, data)

export const deleteParticipant = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/participants/${id}`)

// ─── Front ───────────────────────────────────────────────

export const fetchParticipantDetail = (id: string): Promise<ParticipantVO> =>
  request.get<ParticipantVO>(`/api/event/front/participants/${id}`)

export const fetchParticipantEventsPage = (
  id: string,
  query?: ParticipantEventPageRequest,
): Promise<PageResponseEventVO> =>
  request.get<PageResponseEventVO>(`/api/event/front/participants/${id}/events`, { params: query })
