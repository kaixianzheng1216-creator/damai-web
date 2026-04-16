import { request } from '@/api/request'
import type {
  CategoryVO,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchCategories = (): Promise<CategoryVO[]> =>
  request.get<CategoryVO[]>('/api/event/front/categories')

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminCategories = (): Promise<CategoryVO[]> =>
  request.get<CategoryVO[]>('/api/event/admin/categories')

export const createCategory = (data: CategoryCreateRequest): Promise<CategoryVO> =>
  request.post<CategoryVO>('/api/event/admin/categories', data)

export const updateCategory = (id: string, data: CategoryUpdateRequest): Promise<CategoryVO> =>
  request.put<CategoryVO>(`/api/event/admin/categories/${id}`, data)

export const deleteCategory = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/categories/${id}`)
