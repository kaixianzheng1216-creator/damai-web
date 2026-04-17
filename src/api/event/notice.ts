import { request } from '@/api/request'
import type {
  NoticeVO,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticePageRequest,
  PageResponseNoticeVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminNotices = (): Promise<NoticeVO[]> =>
  request.get<NoticeVO[]>('/api/event/admin/notices')

export const fetchAdminNoticesPage = (query?: NoticePageRequest): Promise<PageResponseNoticeVO> =>
  request.get<PageResponseNoticeVO>('/api/event/admin/notices/page', { params: query })

export const createNotice = (data: NoticeCreateRequest): Promise<NoticeVO> =>
  request.post<NoticeVO>('/api/event/admin/notices', data)

export const updateNotice = (id: string, data: NoticeUpdateRequest): Promise<NoticeVO> =>
  request.put<NoticeVO>(`/api/event/admin/notices/${id}`, data)

export const deleteNotice = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/notices/${id}`)
