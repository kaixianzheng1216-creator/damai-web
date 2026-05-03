import type { PaginatedResponse } from '@/api/types'

// ─── Category ────────────────────────────────────────────

export interface CategoryVO {
  id: string
  parentId: string
  name: string
  sortOrder: number
  children?: CategoryVO[]
}

export interface CategoryCreateRequest {
  parentId: string
  name: string
  sortOrder?: number
}

export interface CategoryUpdateRequest {
  name?: string
  sortOrder?: number
}

export interface CategoryPageRequest {
  page?: number
  size?: number
  name?: string
}

export type PageResponseCategoryVO = PaginatedResponse<CategoryVO>
