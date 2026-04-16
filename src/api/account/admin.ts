import { request } from '@/api/request'
import type {
  AdminVO,
  AdminCreateRequest,
  AdminUpdateRequest,
  AdminPageRequest,
  PageResponseAdminVO,
} from './types'

export const fetchAdminPage = (params: AdminPageRequest): Promise<PageResponseAdminVO> =>
  request.get<PageResponseAdminVO>('/api/account/admin/admin/page', { params })

export const fetchAdminInfo = (): Promise<AdminVO> =>
  request.get<AdminVO>('/api/account/admin/admin/info')

export const createAdmin = (data: AdminCreateRequest): Promise<AdminVO> =>
  request.post<AdminVO>('/api/account/admin/admin', data)

export const updateAdmin = (id: string, data: AdminUpdateRequest): Promise<AdminVO> =>
  request.put<AdminVO>(`/api/account/admin/admin/${id}`, data)

export const updateAdminStatus = (id: string, status: number): Promise<void> =>
  request.put<void>(`/api/account/admin/admin/${id}/status`, { status })
