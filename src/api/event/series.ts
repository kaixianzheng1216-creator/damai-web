import { request } from '@/api/request'
import type {
  SeriesEventVO,
  SeriesCreateRequest,
  SeriesUpdateRequest,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminSeries = (): Promise<SeriesEventVO[]> =>
  request.get<SeriesEventVO[]>('/api/event/admin/series')

export const createSeries = (data: SeriesCreateRequest): Promise<SeriesEventVO> =>
  request.post<SeriesEventVO>('/api/event/admin/series', data)

export const updateSeries = (id: string, data: SeriesUpdateRequest): Promise<SeriesEventVO> =>
  request.put<SeriesEventVO>(`/api/event/admin/series/${id}`, data)

export const deleteSeries = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/series/${id}`)
