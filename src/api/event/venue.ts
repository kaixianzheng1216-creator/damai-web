import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  VenueVO,
  VenueCreateRequest,
  VenueUpdateRequest,
  VenuePageRequest,
  PageResponseVenueVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminVenueList = (): Promise<VenueVO[]> =>
  request.get<VenueVO[]>('/api/event/admin/venues')

/** @deprecated Use fetchAdminVenueList instead */
export const fetchAdminVenues = fetchAdminVenueList

export const fetchAdminVenuesPage = (query?: VenuePageRequest): Promise<PageResponseVenueVO> =>
  request.get<PageResponseVenueVO>('/api/event/admin/venues/page', { params: query })

export const createVenue = (data: VenueCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/venues', data).then(normalizeEntityId)

export const updateVenue = (id: string, data: VenueUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/venues/${id}`, data)

export const deleteVenue = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/venues/${id}`)

// ─── Front ───────────────────────────────────────────────

export const fetchVenueById = (id: string): Promise<VenueVO> =>
  request.get<VenueVO>(`/api/event/front/venues/${id}`)

/** @deprecated Use fetchVenueById instead */
export const fetchVenueDetail = fetchVenueById
