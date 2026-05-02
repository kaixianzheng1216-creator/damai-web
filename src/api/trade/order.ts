import { request } from '@/api/request'
import type {
  TicketOrderVO,
  TicketOrderPageRequest,
  PageResponseTicketOrderVO,
  OrderStatusVO,
} from './types'

export const fetchMyOrderPage = (
  params: TicketOrderPageRequest,
): Promise<PageResponseTicketOrderVO> =>
  request.get<PageResponseTicketOrderVO>('/api/order/front/ticket-orders/my', { params })

export const fetchMyPurchaseCounts = (ticketTypeIds: string[]): Promise<Record<string, number>> =>
  request.get<Record<string, number>>('/api/order/front/ticket-orders/purchase-counts', {
    params: { ticketTypeIds: ticketTypeIds.map(String) },
  })

export const fetchMyOrderById = (id: string): Promise<TicketOrderVO> =>
  request.get<TicketOrderVO>(`/api/order/front/ticket-orders/${id}`)

export const fetchMyOrderStatus = (id: string): Promise<OrderStatusVO> =>
  request.get<OrderStatusVO>(`/api/order/front/ticket-orders/${id}/status`)

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminOrderPage = (
  params: TicketOrderPageRequest,
): Promise<PageResponseTicketOrderVO> =>
  request.get<PageResponseTicketOrderVO>('/api/order/admin/ticket-orders', { params })

export const fetchAdminOrderById = (id: string): Promise<TicketOrderVO> =>
  request.get<TicketOrderVO>(`/api/order/admin/ticket-orders/${id}`)
