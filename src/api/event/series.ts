import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  SeriesEventVO,
  SeriesCreateRequest,
  SeriesUpdateRequest,
  SeriesPageRequest,
  PageResponseSeriesVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminSeriesList = (): Promise<SeriesEventVO[]> =>
  request.get<SeriesEventVO[]>('/api/event/admin/series')

/** @deprecated Use fetchAdminSeriesList instead */
export const fetchAdminSeries = fetchAdminSeriesList

export const fetchAdminSeriesPage = (query?: SeriesPageRequest): Promise<PageResponseSeriesVO> =>
  request.get<PageResponseSeriesVO>('/api/event/admin/series/page', { params: query })

export const createSeries = (data: SeriesCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/series', data).then(normalizeEntityId)

export const updateSeries = (id: string, data: SeriesUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/series/${id}`, data)

export const deleteSeries = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/series/${id}`)
