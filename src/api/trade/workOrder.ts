import { request } from '@/api/request'
import type { PageResponseWorkOrderVO, WorkOrderDetailVO, WorkOrderPageRequest } from './types'

export const fetchMyWorkOrderPage = (
  params: WorkOrderPageRequest,
): Promise<PageResponseWorkOrderVO> =>
  request.get<PageResponseWorkOrderVO>('/api/order/front/work-orders/my', { params })

export const fetchMyWorkOrderById = (id: string): Promise<WorkOrderDetailVO> =>
  request.get<WorkOrderDetailVO>(`/api/order/front/work-orders/${id}`)

export const cancelMyWorkOrder = (id: string): Promise<void> =>
  request.post<void>(`/api/order/front/work-orders/${id}/close`)

export const fetchAdminWorkOrderPage = (
  params: WorkOrderPageRequest,
): Promise<PageResponseWorkOrderVO> =>
  request.get<PageResponseWorkOrderVO>('/api/order/admin/work-orders', { params })

export const fetchAdminWorkOrderById = (id: string): Promise<WorkOrderDetailVO> =>
  request.get<WorkOrderDetailVO>(`/api/order/admin/work-orders/${id}`)
export const cancelAdminWorkOrder = (id: string): Promise<void> =>
  request.post<void>(`/api/order/admin/work-orders/${id}/close`)
