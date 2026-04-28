import { request } from '@/api/request'
import type {
  TicketOrderVO,
  TicketOrderPageRequest,
  PageResponseTicketOrderVO,
  OrderStatusVO,
} from './types'

export const fetchMyOrderPage = (
  params: TicketOrderPageRequest,
): Promise<PageResponseTicketOrderVO> => {
  return request.get<PageResponseTicketOrderVO>('/api/order/front/ticket-orders/my', { params })
}

export const fetchUserPurchaseCounts = (
  ticketTypeIds: string[],
): Promise<Record<string, number>> => {
  const qs = new URLSearchParams()
  ticketTypeIds.forEach((id) => qs.append('ticketTypeIds', id))
  return request.get<Record<string, number>>(
    `/api/order/front/ticket-orders/purchase-counts?${qs.toString()}`,
  )
}

export const fetchOrderById = (id: string): Promise<TicketOrderVO> => {
  return request.get<TicketOrderVO>(`/api/order/front/ticket-orders/${id}`)
}

export const fetchOrderStatus = (id: string): Promise<OrderStatusVO> => {
  return request.get<OrderStatusVO>(`/api/order/front/ticket-orders/${id}/status`)
}

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminOrderPage = (
  params: TicketOrderPageRequest,
): Promise<PageResponseTicketOrderVO> => {
  return request.get<PageResponseTicketOrderVO>('/api/order/admin/ticket-orders', { params })
}

export const fetchAdminOrderById = (id: string): Promise<TicketOrderVO> => {
  return request.get<TicketOrderVO>(`/api/order/admin/ticket-orders/${id}`)
}
