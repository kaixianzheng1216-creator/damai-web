import { request } from '@/api/request'
import type {
  PageResponseWorkOrderVO,
  WorkOrderDetailVO,
  WorkOrderPageRequest,
  WorkOrderReplyCreateRequest,
} from './types'

export const fetchMyWorkOrderPage = (
  params: WorkOrderPageRequest,
): Promise<PageResponseWorkOrderVO> => {
  return request.get<PageResponseWorkOrderVO>('/api/order/front/work-orders/my', { params })
}

export const fetchWorkOrderById = (id: string): Promise<WorkOrderDetailVO> => {
  return request.get<WorkOrderDetailVO>(`/api/order/front/work-orders/${id}`)
}

export const submitWorkOrderReply = (
  id: string,
  data: WorkOrderReplyCreateRequest,
): Promise<void> => {
  return request.post<void>(`/api/order/front/work-orders/${id}/replies`, data)
}

/** @deprecated Use submitWorkOrderReply instead */
export const replyWorkOrder = submitWorkOrderReply

export const closeWorkOrder = (id: string): Promise<void> => {
  return request.post<void>(`/api/order/front/work-orders/${id}/close`)
}

export const fetchAdminWorkOrderPage = (
  params: WorkOrderPageRequest,
): Promise<PageResponseWorkOrderVO> => {
  return request.get<PageResponseWorkOrderVO>('/api/order/admin/work-orders', { params })
}

export const fetchAdminWorkOrderById = (id: string): Promise<WorkOrderDetailVO> => {
  return request.get<WorkOrderDetailVO>(`/api/order/admin/work-orders/${id}`)
}

export const submitAdminWorkOrderReply = (
  id: string,
  data: WorkOrderReplyCreateRequest,
): Promise<void> => {
  return request.post<void>(`/api/order/admin/work-orders/${id}/replies`, data)
}

/** @deprecated Use submitAdminWorkOrderReply instead */
export const replyAdminWorkOrder = submitAdminWorkOrderReply

export const closeAdminWorkOrder = (id: string): Promise<void> => {
  return request.post<void>(`/api/order/admin/work-orders/${id}/close`)
}
