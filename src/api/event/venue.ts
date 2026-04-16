import { request } from '@/api/request'
import type {
  VenueVO,
  VenueCreateRequest,
  VenueUpdateRequest,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminVenues = (): Promise<VenueVO[]> =>
  request.get<VenueVO[]>('/api/event/admin/venues')

export const createVenue = (data: VenueCreateRequest): Promise<VenueVO> =>
  request.post<VenueVO>('/api/event/admin/venues', data)

export const updateVenue = (id: string, data: VenueUpdateRequest): Promise<VenueVO> =>
  request.put<VenueVO>(`/api/event/admin/venues/${id}`, data)

export const deleteVenue = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/venues/${id}`)
