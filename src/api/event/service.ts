import { request } from '@/api/request'
import type {
  ServiceGuaranteeVO,
  ServiceGuaranteeCreateRequest,
  ServiceGuaranteeUpdateRequest,
  ServiceOptionCreateRequest,
  ServiceOptionUpdateRequest,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminServices = (): Promise<ServiceGuaranteeVO[]> =>
  request.get<ServiceGuaranteeVO[]>('/api/event/admin/services')

export const createService = (
  data: ServiceGuaranteeCreateRequest,
): Promise<ServiceGuaranteeVO> => request.post<ServiceGuaranteeVO>('/api/event/admin/services', data)

export const updateService = (
  id: string,
  data: ServiceGuaranteeUpdateRequest,
): Promise<ServiceGuaranteeVO> => request.put<ServiceGuaranteeVO>(`/api/event/admin/services/${id}`, data)

export const deleteService = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/services/${id}`)

export const createServiceOption = (
  serviceId: string,
  data: ServiceOptionCreateRequest,
): Promise<void> => request.post<void>(`/api/event/admin/services/${serviceId}/options`, data)

export const updateServiceOption = (
  serviceId: string,
  optionId: string,
  data: ServiceOptionUpdateRequest,
): Promise<void> => request.put<void>(`/api/event/admin/services/${serviceId}/options/${optionId}`, data)

export const deleteServiceOption = (serviceId: string, optionId: string): Promise<void> =>
  request.del<void>(`/api/event/admin/services/${serviceId}/options/${optionId}`)
