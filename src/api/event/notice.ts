import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  NoticeVO,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticePageRequest,
  PageResponseNoticeVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminNoticeList = (): Promise<NoticeVO[]> =>
  request.get<NoticeVO[]>('/api/event/admin/notices')

export const fetchAdminNoticesPage = (params?: NoticePageRequest): Promise<PageResponseNoticeVO> =>
  request.get<PageResponseNoticeVO>('/api/event/admin/notices/page', { params })

export const createNotice = (data: NoticeCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/notices', data).then(normalizeEntityId)

export const updateNotice = (id: string, data: NoticeUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/notices/${id}`, data)

export const deleteNotice = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/notices/${id}`)
