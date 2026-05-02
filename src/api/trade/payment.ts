import { request } from '@/api/request'
import type {
  TicketOrderCreateRequest,
  PaymentCreateRequest,
  OrderStatusVO,
  PaymentVO,
  RefundCreateRequest,
  RefundVO,
} from './types'

export const createTicketOrder = (data: TicketOrderCreateRequest): Promise<OrderStatusVO> =>
  request.post<OrderStatusVO>('/api/order/front/ticket-orders', data)

export const createPayment = (id: string, data: PaymentCreateRequest): Promise<PaymentVO> =>
  request.post<PaymentVO>(`/api/order/front/ticket-orders/${id}/pay`, data)

export const cancelTicketOrder = (id: string): Promise<void> =>
  request.post<void>(`/api/order/front/ticket-orders/${id}/cancel`)

export const createRefund = (id: string, data: RefundCreateRequest): Promise<RefundVO> =>
  request.post<RefundVO>(`/api/order/front/ticket-orders/${id}/refund`, data)
