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

export const fetchOrderById = (id: string): Promise<TicketOrderVO> => {
  return request.get<TicketOrderVO>(`/api/order/front/ticket-orders/${id}`)
}

export const fetchOrderStatus = (id: string): Promise<OrderStatusVO> => {
  return request.get<OrderStatusVO>(`/api/order/front/ticket-orders/${id}/status`)
}
