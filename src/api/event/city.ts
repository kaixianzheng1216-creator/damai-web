import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  CityVO,
  CityListVO,
  CityCreateRequest,
  CityUpdateRequest,
  CityPageRequest,
  PageResponseCityVO,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchGroupedCities = (): Promise<CityListVO> =>
  request.get<CityListVO>('/api/event/front/cities')

export const fetchCitiesList = (): Promise<CityVO[]> =>
  request.get<CityVO[]>('/api/event/front/cities/list')

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminCities = (): Promise<CityVO[]> =>
  request.get<CityVO[]>('/api/event/admin/cities')

export const fetchAdminCitiesPage = (query?: CityPageRequest): Promise<PageResponseCityVO> =>
  request.get<PageResponseCityVO>('/api/event/admin/cities/page', { params: query })

export const createCity = (data: CityCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/cities', data).then(normalizeEntityId)

export const updateCity = (id: string, data: CityUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/cities/${id}`, data)

export const deleteCity = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/cities/${id}`)

export const updateCityFeatured = (id: string, isFeatured: number): Promise<void> =>
  request.patch<void>(`/api/event/admin/cities/${id}/featured`, { isFeatured })
