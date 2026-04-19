import { request } from '@/api/request'
import type {
  ParticipantVO,
  ParticipantCreateRequest,
  ParticipantUpdateRequest,
  ParticipantPageRequest,
  PageResponseParticipantVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminParticipants = (): Promise<ParticipantVO[]> =>
  request.get<ParticipantVO[]>('/api/event/admin/participants')

export const fetchAdminParticipantsPage = (
  query?: ParticipantPageRequest,
): Promise<PageResponseParticipantVO> =>
  request.get<PageResponseParticipantVO>('/api/event/admin/participants/page', { params: query })

export const createParticipant = (data: ParticipantCreateRequest): Promise<ParticipantVO> =>
  request.post<ParticipantVO>('/api/event/admin/participants', data)

export const updateParticipant = (
  id: string,
  data: ParticipantUpdateRequest,
): Promise<ParticipantVO> => request.put<ParticipantVO>(`/api/event/admin/participants/${id}`, data)

export const deleteParticipant = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/participants/${id}`)
