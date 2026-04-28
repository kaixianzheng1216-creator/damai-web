import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  EventDetailVO,
  EventPageRequest,
  PageResponseEventVO,
  AdminEventPageRequest,
  AdminPageResponseEventVO,
  EventCreateRequest,
  EventUpdateRequest,
  SessionBatchCreateRequest,
  SessionUpdateRequest,
  TicketTypeCreateRequest,
  TicketTypeUpdateRequest,
  TicketTypeInventoryAdjustRequest,
  EventServiceBatchAddRequest,
  EventParticipantBatchAddRequest,
  EventParticipantSortRequest,
  EventInfoCreateRequest,
  TicketTypeCopyRequest,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchEventPage = (params: EventPageRequest): Promise<PageResponseEventVO> =>
  request.get<PageResponseEventVO>('/api/event/front/events/page', { params })

export const fetchEventDetailById = (id: string): Promise<EventDetailVO> =>
  request.get<EventDetailVO>(`/api/event/front/events/${id}`)

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminEventPage = (
  params: AdminEventPageRequest,
): Promise<AdminPageResponseEventVO> =>
  request.get<AdminPageResponseEventVO>('/api/event/admin/events/page', { params })

export const fetchEventById = (id: string): Promise<EventDetailVO> =>
  request.get<EventDetailVO>(`/api/event/admin/events/${id}`)

export const createEvent = (data: EventCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/events', data).then(normalizeEntityId)

export const updateEvent = (id: string, data: EventUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/events/${id}`, data)

export const deleteEvent = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/events/${id}`)

export const publishEvent = (id: string): Promise<void> =>
  request.put<void>(`/api/event/admin/events/${id}/publish`)

export const offlineEvent = (id: string): Promise<void> =>
  request.put<void>(`/api/event/admin/events/${id}/offline`)

export const saveEventInfo = (id: string, data: EventInfoCreateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/events/${id}/detail`, data)

// ─── Session ─────────────────────────────────────────────

export const batchAddSessions = (eventId: string, data: SessionBatchCreateRequest): Promise<void> =>
  request.post<void>(`/api/event/admin/events/${eventId}/sessions/batch`, data)

export const updateSession = (
  eventId: string,
  sessionId: string,
  data: SessionUpdateRequest,
): Promise<void> =>
  request.put<void>(`/api/event/admin/events/${eventId}/sessions/${sessionId}`, data)

export const deleteSession = (eventId: string, sessionId: string): Promise<void> =>
  request.del<void>(`/api/event/admin/events/${eventId}/sessions/${sessionId}`)

// ─── Ticket Type ─────────────────────────────────────────

export const createTicketType = (
  eventId: string,
  sessionId: string,
  data: TicketTypeCreateRequest,
): Promise<string> =>
  request
    .post<RawEntityId>(
      `/api/event/admin/events/${eventId}/sessions/${sessionId}/ticket-types`,
      data,
    )
    .then(normalizeEntityId)

export const updateTicketType = (
  eventId: string,
  ticketTypeId: string,
  data: TicketTypeUpdateRequest,
): Promise<void> =>
  request.put<void>(`/api/event/admin/events/${eventId}/ticket-types/${ticketTypeId}`, data)

export const deleteTicketType = (eventId: string, ticketTypeId: string): Promise<void> =>
  request.del<void>(`/api/event/admin/events/${eventId}/ticket-types/${ticketTypeId}`)

export const adjustTicketTypeInventory = (
  eventId: string,
  ticketTypeId: string,
  data: TicketTypeInventoryAdjustRequest,
): Promise<void> =>
  request.put<void>(
    `/api/event/admin/events/${eventId}/ticket-types/${ticketTypeId}/inventory`,
    data,
  )

// ─── Service ─────────────────────────────────────────────

export const batchAddServices = (
  eventId: string,
  data: EventServiceBatchAddRequest,
): Promise<void> => request.post<void>(`/api/event/admin/events/${eventId}/services/batch`, data)

export const removeService = (eventId: string, eventServiceId: string): Promise<void> =>
  request.del<void>(`/api/event/admin/events/${eventId}/services/${eventServiceId}`)

// ─── Participant ─────────────────────────────────────────

export const removeParticipant = (eventId: string, eventParticipantId: string): Promise<void> =>
  request.del<void>(`/api/event/admin/events/${eventId}/participants/${eventParticipantId}`)

export const batchAddParticipants = (
  eventId: string,
  data: EventParticipantBatchAddRequest,
): Promise<void> =>
  request.post<void>(`/api/event/admin/events/${eventId}/participants/batch`, data)

export const sortParticipants = (
  eventId: string,
  data: EventParticipantSortRequest,
): Promise<void> => request.put<void>(`/api/event/admin/events/${eventId}/participants/sort`, data)

export const copyTicketTypes = (eventId: string, data: TicketTypeCopyRequest): Promise<void> =>
  request.post<void>(`/api/event/admin/events/${eventId}/ticket-types/copy`, data)

export const publishAllEvents = (): Promise<void> =>
  request.put<void>('/api/event/admin/events/publish-all')
