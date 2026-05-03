import type { PaginatedResponse } from '@/api/types'

// ─── Series ──────────────────────────────────────────────

export interface SeriesEventVO {
  id: string
  name: string
}

export interface SeriesCreateRequest {
  name: string
}

export interface SeriesUpdateRequest {
  name?: string
}

export interface SeriesPageRequest {
  page?: number
  size?: number
  name?: string
}

export type PageResponseSeriesVO = PaginatedResponse<SeriesEventVO>
