import { request } from '@/api/request'
import type { TicketPageRequest, TicketVO, PageResponseTicketVO } from './types'

export const fetchMyTicketPage = (params: TicketPageRequest): Promise<PageResponseTicketVO> =>
  request.get<PageResponseTicketVO>('/api/ticket/front/tickets/my', { params })

export const fetchMyTicketById = (id: string): Promise<TicketVO> =>
  request.get<TicketVO>(`/api/ticket/front/tickets/${id}`)

export const fetchAdminTicketPage = (params: TicketPageRequest): Promise<PageResponseTicketVO> =>
  request.get<PageResponseTicketVO>('/api/ticket/admin/tickets/page', { params })

export const adminCheckinTicket = (qrCodeToken: string): Promise<void> =>
  request.post<void>(`/api/ticket/admin/tickets/checkin/${qrCodeToken}`)
