import type { PaginatedResponse } from '../../types'

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

export interface VenuePageRequest {
  page?: number
  size?: number
  name?: string
  province?: string
  city?: string
  district?: string
}

export type PageResponseVenueVO = PaginatedResponse<VenueVO>

// ─── Participant ─────────────────────────────────────────

export interface ParticipantVO {
  id: string
  name: string
  avatarUrl: string
  followCount?: number
}

export interface ParticipantEventPageRequest {
  page?: number
  size?: number
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

export interface ParticipantPageRequest {
  page?: number
  size?: number
  name?: string
}

export type PageResponseParticipantVO = PaginatedResponse<ParticipantVO>

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
  serviceGuaranteeId: string
  serviceGuaranteeOptionId: string
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

export interface ServiceGuaranteePageRequest {
  page?: number
  size?: number
  name?: string
}

export type PageResponseServiceGuaranteeVO = PaginatedResponse<ServiceGuaranteeVO>

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

export interface NoticePageRequest {
  page?: number
  size?: number
  type?: number
  name?: string
}

export type PageResponseNoticeVO = PaginatedResponse<NoticeVO>
