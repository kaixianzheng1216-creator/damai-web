import { request } from '@/api/request'
import type {
  BannerVO,
  BannerCreateRequest,
  BannerUpdateRequest,
  BannerPageQuery,
  PageResponseBannerVO,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchBanners = (cityId?: string): Promise<BannerVO[]> =>
  request.get<BannerVO[]>('/api/event/front/banners', cityId ? { params: { cityId } } : undefined)

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminBanners = (query?: BannerPageQuery): Promise<PageResponseBannerVO> =>
  request.get<PageResponseBannerVO>('/api/event/admin/banners/page', { params: query })

export const createBanner = (data: BannerCreateRequest): Promise<BannerVO> =>
  request.post<BannerVO>('/api/event/admin/banners', data)

export const updateBanner = (id: string, data: BannerUpdateRequest): Promise<BannerVO> =>
  request.put<BannerVO>(`/api/event/admin/banners/${id}`, data)

export const deleteBanner = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/banners/${id}`)
