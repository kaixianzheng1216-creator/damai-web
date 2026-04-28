import { request } from '@/api/request'
import { normalizeEntityId, type RawEntityId } from '@/api/types'
import type {
  ServiceGuaranteeVO,
  ServiceGuaranteeCreateRequest,
  ServiceGuaranteeUpdateRequest,
  ServiceOptionCreateRequest,
  ServiceOptionUpdateRequest,
  ServiceGuaranteePageRequest,
  PageResponseServiceGuaranteeVO,
} from './types'

// ─── Admin ───────────────────────────────────────────────

export const fetchAdminServices = (): Promise<ServiceGuaranteeVO[]> =>
  request.get<ServiceGuaranteeVO[]>('/api/event/admin/services')

export const fetchAdminServicesPage = (
  query?: ServiceGuaranteePageRequest,
): Promise<PageResponseServiceGuaranteeVO> =>
  request.get<PageResponseServiceGuaranteeVO>('/api/event/admin/services/page', { params: query })

export const createService = (data: ServiceGuaranteeCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/services', data).then(normalizeEntityId)

export const updateService = (id: string, data: ServiceGuaranteeUpdateRequest): Promise<void> =>
  request.put<void>(`/api/event/admin/services/${id}`, data)

export const deleteService = (id: string): Promise<void> =>
  request.del<void>(`/api/event/admin/services/${id}`)

export const createServiceOption = (
  serviceId: string,
  data: ServiceOptionCreateRequest,
): Promise<string> =>
  request
    .post<RawEntityId>(`/api/event/admin/services/${serviceId}/options`, data)
    .then(normalizeEntityId)

export const updateServiceOption = (
  _serviceId: string,
  optionId: string,
  data: ServiceOptionUpdateRequest,
): Promise<void> => request.put<void>(`/api/event/admin/services/options/${optionId}`, data)

export const deleteServiceOption = (_serviceId: string, optionId: string): Promise<void> =>
  request.del<void>(`/api/event/admin/services/options/${optionId}`)
