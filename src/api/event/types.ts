import type { PaginatedResponse } from '../types'

// ─── Event ───────────────────────────────────────────────

export interface EventVO {
  id: string
  seriesId?: string
  categoryId: string
  categoryNameSnapshot?: string
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
  status: number
  statusLabel?: string
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
  minPrice?: number
  maxPrice?: number
}

export type PageResponseEventVO = PaginatedResponse<EventVO>

// Admin
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

export interface SessionItem {
  name: string
  startAt?: string
  endAt?: string
}

export interface SessionBatchCreateRequest {
  sessions: SessionItem[]
}

export interface SessionUpdateRequest {
  name?: string
  startAt?: string
  endAt?: string
  status?: number
}

export interface TicketTypeCreateRequest {
  name: string
  salePrice: number
  orderLimit?: number
  accountLimit?: number
  saleStartAt?: string
  saleEndAt?: string
  totalQty: number
}

export interface TicketTypeUpdateRequest {
  name?: string
  salePrice?: number
  orderLimit?: number
  accountLimit?: number
  status?: number
  saleStartAt?: string
  saleEndAt?: string
}

export interface TicketTypeInventoryAdjustRequest {
  adjustQty: number
}

export interface ServiceItem {
  serviceGuaranteeId: number
  serviceGuaranteeOptionId: number
}

export interface EventServiceBatchAddRequest {
  services: ServiceItem[]
}

export interface EventParticipantBatchAddRequest {
  participantIds: number[]
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

// ─── Session & TicketType ────────────────────────────────

export interface TicketInventoryVO {
  ticketTypeId: string
  totalQty: number
  lockedQty: number
  soldQty: number
}

export interface TicketTypeVO {
  id: string
  eventId?: string
  sessionId: string
  name: string
  price: number
  salePrice?: number
  orderLimit: number
  accountLimit: number
  status: number
  statusLabel: string
  saleStartAt: string
  saleEndAt: string
  inventory?: TicketInventoryVO
}

export interface SessionVO {
  id: string
  eventId?: string
  name: string
  startAt: string
  endAt: string
  status: number
  statusLabel: string
  ticketTypes: TicketTypeVO[]
}

export interface SeriesEventVO {
  id: string
  name: string
}

export interface SeriesCreateRequest {
  name: string
}

export interface SeriesUpdateRequest {
  name?: string
}

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

// ─── Venue ───────────────────────────────────────────────

export interface VenueVO {
  id: string
  name: string
  province: string
  city: string
  district: string
  address: string
}

export interface VenueCreateRequest {
  name: string
  province: string
  city: string
  district: string
  address: string
}

export interface VenueUpdateRequest {
  name?: string
  province?: string
  city?: string
  district?: string
  address?: string
}

// ─── Participant ─────────────────────────────────────────

export interface ParticipantVO {
  id: string
  name: string
  avatarUrl: string
}

export interface EventParticipantVO {
  id: string
  participant: ParticipantVO
  sortOrder: number
}

export interface ParticipantCreateRequest {
  name: string
  avatarUrl?: string
}

export interface ParticipantUpdateRequest {
  name?: string
  avatarUrl?: string
}

// ─── Notice ──────────────────────────────────────────────

export interface NoticeVO {
  id: string
  type: number
  name: string
  sortOrder: number
}

export interface NoticeItemVO {
  id?: string
  name: string
  description: string
}

export interface EventInfoVO {
  description: string
  purchaseNotice: NoticeItemVO[]
  admissionNotice: NoticeItemVO[]
}

export interface NoticeCreateRequest {
  type: number
  name: string
  sortOrder?: number
}

export interface NoticeUpdateRequest {
  name?: string
  sortOrder?: number
}

// ─── Service Guarantee ───────────────────────────────────

export interface ServiceGuaranteeVO {
  id: string
  name: string
  sortOrder: number
  options: ServiceGuaranteeOptionVO[]
}

export interface ServiceGuaranteeOptionVO {
  id: string
  serviceGuaranteeId: string
  name: string
  description: string
  isBooleanType: number
}

export interface EventServiceGuaranteeVO {
  id: string
  serviceGuarantee: ServiceGuaranteeVO
  serviceGuaranteeOption: ServiceGuaranteeOptionVO
}

export interface ServiceGuaranteeCreateRequest {
  name: string
  sortOrder?: number
}

export interface ServiceGuaranteeUpdateRequest {
  name?: string
  sortOrder?: number
}

export interface ServiceOptionCreateRequest {
  name: string
  description?: string
  isBooleanType?: number
}

export interface ServiceOptionUpdateRequest {
  name?: string
  description?: string
  isBooleanType?: number
}

// ─── Home (Frontend Display) ─────────────────────────────

// ─── Series Page ─────────────────────────────────────────
export interface SeriesPageRequest {
  page?: number
  size?: number
  name?: string
}
export type PageResponseSeriesVO = PaginatedResponse<SeriesEventVO>

// ─── Category Page ───────────────────────────────────────
export interface CategoryPageRequest {
  page?: number
  size?: number
  name?: string
}
export type PageResponseCategoryVO = PaginatedResponse<CategoryVO>

// ─── City Page ───────────────────────────────────────────
export interface CityPageRequest {
  page?: number
  size?: number
  name?: string
}
export type PageResponseCityVO = PaginatedResponse<CityVO>

// ─── Notice Page ─────────────────────────────────────────
export interface NoticePageRequest {
  page?: number
  size?: number
  type?: number
  name?: string
}
export type PageResponseNoticeVO = PaginatedResponse<NoticeVO>

// ─── Participant Page ─────────────────────────────────────
export interface ParticipantPageRequest {
  page?: number
  size?: number
  name?: string
}
export type PageResponseParticipantVO = PaginatedResponse<ParticipantVO>

// ─── ServiceGuarantee Page ────────────────────────────────
export interface ServiceGuaranteePageRequest {
  page?: number
  size?: number
  name?: string
}
export type PageResponseServiceGuaranteeVO = PaginatedResponse<ServiceGuaranteeVO>

// ─── Venue Page ───────────────────────────────────────────
export interface VenuePageRequest {
  page?: number
  size?: number
  name?: string
  province?: string
  city?: string
  district?: string
}
export type PageResponseVenueVO = PaginatedResponse<VenueVO>

// ─── Home (Frontend Display) ─────────────────────────────
export type HomeBannerItem = BannerVO

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

export interface TicketTypeCopyRequest {
  sourceSessionId: string
  targetSessionIds: string[]
}
