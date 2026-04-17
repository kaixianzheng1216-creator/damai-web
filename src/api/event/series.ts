import { request } from '@/api/request'
import type {
  SeriesEventVO,
  SeriesCreateRequest,
  SeriesUpdateRequest,
  SeriesPageRequest,
  PageResponseSeriesVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminSeries = (): Promise<SeriesEventVO[]> =>
  request.get<SeriesEventVO[]>('/api/event/admin/series')

export const fetchAdminSeriesPage = (query?: SeriesPageRequest): Promise<PageResponseSeriesVO> =>
  request.get<PageResponseSeriesVO>('/api/event/admin/series/page', { params: query })

export const createSeries = (data: SeriesCreateRequest): Promise<SeriesEventVO> =>
  request.post<SeriesEventVO>('/api/event/admin/series', data)

export const updateSeries = (id: string, data: SeriesUpdateRequest): Promise<SeriesEventVO> =>
  request.put<SeriesEventVO>(`/api/event/admin/series/${id}`, data)

export const deleteSeries = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/series/${id}`)
