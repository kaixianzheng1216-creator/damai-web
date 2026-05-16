import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
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

export const fetchAdminById = (id: string): Promise<AdminVO> =>
  request.get<AdminVO>(`/api/account/admin/admin/${id}`)

export const createAdmin = (data: AdminCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/account/admin/admin', data).then(normalizeEntityId)

export const updateAdmin = (id: string, data: AdminUpdateRequest): Promise<void> =>
  request.put<void>(`/api/account/admin/admin/${id}`, data)

export const updateAdminStatus = (id: string, status: 0 | 1): Promise<void> =>
  request.put<void>(`/api/account/admin/admin/${id}/status`, status, {
    headers: { 'Content-Type': 'application/json' },
  })
