import { request } from '@/api/request'
import type {
  CityVO,
  CityListVO,
  CityCreateRequest,
  CityUpdateRequest,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchGroupedCities = (): Promise<CityListVO> =>
  request.get<CityListVO>('/api/event/front/cities')

export const fetchCitiesList = (): Promise<CityVO[]> =>
  request.get<CityVO[]>('/api/event/front/cities/list')

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminCities = (): Promise<CityVO[]> =>
  request.get<CityVO[]>('/api/event/admin/cities')

export const createCity = (data: CityCreateRequest): Promise<CityVO> =>
  request.post<CityVO>('/api/event/admin/cities', data)

export const updateCity = (id: string, data: CityUpdateRequest): Promise<CityVO> =>
  request.put<CityVO>(`/api/event/admin/cities/${id}`, data)

export const deleteCity = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/cities/${id}`)

export const updateCityFeatured = (id: string, isFeatured: number): Promise<void> =>
  request.put<void>(`/api/event/admin/cities/${id}/featured`, { isFeatured })
