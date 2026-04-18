import { request } from '@/api/request'
import type { TicketPageRequest, TicketVO, PageResponseTicketVO } from './types'

export const fetchMyTicketPage = (params: TicketPageRequest): Promise<PageResponseTicketVO> => {
  return request.get<PageResponseTicketVO>('/api/ticket/front/tickets/my', { params })
}

export const fetchTicketById = (id: string): Promise<TicketVO> => {
  return request.get<TicketVO>(`/api/ticket/front/tickets/${id}`)
}

export const fetchAdminTicketPage = (params: TicketPageRequest): Promise<PageResponseTicketVO> => {
  return request.get<PageResponseTicketVO>('/api/ticket/admin/tickets/page', { params })
}

export const checkinTicket = (qrCodeToken: string): Promise<void> => {
  return request.post<void>(`/api/ticket/admin/tickets/checkin/${qrCodeToken}`)
}
