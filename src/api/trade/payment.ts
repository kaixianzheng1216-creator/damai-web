import { request } from '@/api/request'
import type {
  TicketOrderCreateRequest,
  PaymentCreateRequest,
  OrderStatusVO,
  PaymentVO,
  RefundCreateRequest,
  RefundVO,
} from './types'

export const createTicketOrder = (data: TicketOrderCreateRequest): Promise<OrderStatusVO> => {
  return request.post<OrderStatusVO>('/api/order/front/ticket-orders', data)
}

export const createPayment = (id: string, data: PaymentCreateRequest): Promise<PaymentVO> => {
  return request.post<PaymentVO>(`/api/order/front/ticket-orders/${id}/pay`, data)
}

export const cancelTicketOrder = (id: string): Promise<void> => {
  return request.post<void>(`/api/order/front/ticket-orders/${id}/cancel`)
}

export const createRefund = (id: string, data: RefundCreateRequest): Promise<RefundVO> => {
  return request.post<RefundVO>(`/api/order/front/ticket-orders/${id}/refund`, data)
}
