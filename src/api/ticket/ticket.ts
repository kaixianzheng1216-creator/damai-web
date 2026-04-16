import { request } from '@/api/request'
import type { TicketPageRequest, TicketVO, PageResponseTicketVO } from './types'

export const fetchMyTicketPage = (params: TicketPageRequest): Promise<PageResponseTicketVO> => {
  return request.get<PageResponseTicketVO>('/api/ticket/front/tickets/my', { params })
}

export const fetchTicketById = (id: string): Promise<TicketVO> => {
  return request.get<TicketVO>(`/api/ticket/front/tickets/${id}`)
}
