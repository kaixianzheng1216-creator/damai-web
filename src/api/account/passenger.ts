import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  PassengerCreateRequest,
  PassengerUpdateRequest,
  PassengerPageRequest,
  PageResponsePassengerVO,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchPassengerPage = (
  params: PassengerPageRequest,
): Promise<PageResponsePassengerVO> =>
  request.get<PageResponsePassengerVO>('/api/account/front/passenger/page', { params })

export const createPassenger = (data: PassengerCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/account/front/passenger', data).then(normalizeEntityId)

export const updatePassenger = (id: string, data: PassengerUpdateRequest): Promise<void> =>
  request.put<void>(`/api/account/front/passenger/${id}`, data)

export const deletePassenger = (id: string): Promise<void> =>
  request.del<void>(`/api/account/front/passenger/${id}`)
