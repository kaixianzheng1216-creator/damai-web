import type { PaginatedResponse } from '../../types'
import type { EventInfoVO } from './venue'
import type { EventParticipantVO } from './venue'
import type { EventServiceGuaranteeVO } from './venue'
import type { SessionVO } from './session'
import type { SeriesEventVO } from './series'
import type { ParticipantVO } from './venue'
import type { NoticeItemVO } from './venue'

// ─── Event ───────────────────────────────────────────────

export interface EventVO {
  id: string
  seriesId?: string
  categoryId: string
  categoryNameSnapshot?: string
  parentCategoryNameSnapshot?: string
  venueId: string
  venueNameSnapshot?: string
  cityId: string
  cityNameSnapshot?: string
  name: string
  coverUrl: string
  minPrice?: number
  maxPrice?: number
  firstSessionStartAt?: string
  lastSessionEndAt?: string
  recommendWeight?: number
  followCount?: number
  status: number
  statusLabel?: string
  participants?: EventParticipantVO[]
}

export interface EventPageRequest {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  sortType?: number
  name?: string
  cityId?: string
  categoryId?: string
  timeType?: number
  date?: string
  minPrice?: number
  maxPrice?: number
}

export type PageResponseEventVO = PaginatedResponse<EventVO>

// Admin
/** @deprecated Use PaginatedResponse<EventVO> directly */
export type AdminPageResponseEventVO = PaginatedResponse<EventVO>

export interface AdminEventPageRequest {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  name?: string
  cityId?: string
  categoryId?: string
  timeType?: number
  minPrice?: number
  maxPrice?: number
  sortType?: number
  validPage?: number
  validSize?: number
}

export interface EventCreateRequest {
  seriesId?: string
  categoryId: string
  venueId: string
  cityId: string
  name: string
  coverUrl: string
  recommendWeight?: number
}

export interface EventUpdateRequest {
  seriesId?: string
  categoryId?: string
  venueId?: string
  cityId?: string
  name?: string
  coverUrl?: string
  status?: number
  recommendWeight?: number
}

export interface ServiceItem {
  serviceGuaranteeId: string
  serviceGuaranteeOptionId: string
}

export interface EventServiceBatchAddRequest {
  services: ServiceItem[]
}

export interface EventParticipantBatchAddRequest {
  participantIds: string[]
}

export interface EventParticipantSortRequest {
  eventParticipantIds: string[]
}

export interface EventInfoCreateRequest {
  description?: string
  purchaseNotice?: NoticeItemVO[]
  admissionNotice?: NoticeItemVO[]
}

export type EventDetailVO = {
  event: EventVO
  info: EventInfoVO
  participants: EventParticipantVO[]
  services: EventServiceGuaranteeVO[]
  sessions: SessionVO[]
  seriesEvents: SeriesEventVO[]
}

// ─── Home (Frontend Display) ─────────────────────────────

export interface HomeCategoryItem {
  id: string
  name: string
  icon: string
  linkUrl: string
}

export interface HomeEventCardItem {
  id: string
  seriesName: string
  eventName: string
  coverImageUrl: string
  venueName: string
  dateText: string
  priceText: string
  saleStatus?: string
  categoryName: string
}

// ─── User Follow ─────────────────────────────────────────

export interface UserFollowEventRequest {
  eventId: string
}

export interface UserFollowParticipantRequest {
  participantId: string
}

export interface UserFollowEventVO {
  id: string
  eventId: string
  event: EventVO
  createAt?: string
}

export interface UserFollowParticipantVO {
  id: string
  participantId: string
  participant: ParticipantVO
  createAt?: string
}

export type PageResponseUserFollowEventVO = PaginatedResponse<UserFollowEventVO>

export type PageResponseUserFollowParticipantVO = PaginatedResponse<UserFollowParticipantVO>
