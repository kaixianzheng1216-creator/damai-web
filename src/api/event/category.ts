import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  CategoryVO,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryPageRequest,
  PageResponseCategoryVO,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchCategoryList = (): Promise<CategoryVO[]> =>
  request.get<CategoryVO[]>('/api/event/front/categories')

/** @deprecated Use fetchCategoryList instead */
export const fetchCategories = fetchCategoryList

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminCategoryList = (): Promise<CategoryVO[]> =>
  request.get<CategoryVO[]>('/api/event/admin/categories')

/** @deprecated Use fetchAdminCategoryList instead */
export const fetchAdminCategories = fetchAdminCategoryList

export const fetchAdminCategoriesPage = (
  query?: CategoryPageRequest,
): Promise<PageResponseCategoryVO> =>
  request.get<PageResponseCategoryVO>('/api/event/admin/categories/page', { params: query })

export const createCategory = (data: CategoryCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/categories', data).then(normalizeEntityId)

export const updateCategory = (id: string, data: CategoryUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/categories/${id}`, data)

export const deleteCategory = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/categories/${id}`)
