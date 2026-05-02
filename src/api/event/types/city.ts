import type { PaginatedResponse } from '../../types'

// ─── City ────────────────────────────────────────────────

export interface CityVO {
  id: string
  name: string
  pinyin: string
  firstLetter: string
  isFeatured: number
}

export interface CityListVO {
  featuredCities: CityVO[]
  normalCities: CityVO[]
}

export interface CityCreateRequest {
  name: string
  pinyin: string
  firstLetter: string
}

export interface CityUpdateRequest {
  name?: string
  pinyin?: string
  firstLetter?: string
}

export interface FeaturedUpdateRequest {
  isFeatured: number
}

export interface CityPageRequest {
  page?: number
  size?: number
  name?: string
}

export type PageResponseCityVO = PaginatedResponse<CityVO>

// ─── Banner ──────────────────────────────────────────────

export interface BannerVO {
  id: string
  cityId: string
  title: string
  imageUrl: string
  mobileImageUrl: string
  jumpUrl: string
  sortOrder: number
  displayStartAt: string
  displayEndAt: string
}

export type PageResponseBannerVO = PaginatedResponse<BannerVO>

export interface BannerCreateRequest {
  cityId: string
  title: string
  imageUrl: string
  mobileImageUrl: string
  jumpUrl: string
  displayStartAt: string
  displayEndAt: string
  sortOrder?: number
}

export interface BannerUpdateRequest {
  cityId?: string
  title?: string
  imageUrl?: string
  mobileImageUrl?: string
  jumpUrl?: string
  sortOrder?: number
  displayStartAt?: string
  displayEndAt?: string
}

export interface BannerPageQuery {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  cityId?: string
  title?: string
}

export type HomeBannerItem = BannerVO
