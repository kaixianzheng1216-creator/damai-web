import { request } from '@/api/request'
import type {
  PassengerCreateRequest,
  PassengerPageRequest,
  PageResponsePassengerVO,
} from './types'

// ─── Front ───────────────────────────────────────────────

export const fetchPassengerPage = (params: PassengerPageRequest): Promise<PageResponsePassengerVO> =>
  request.get<PageResponsePassengerVO>('/api/account/front/passenger/page', { params })

export const createPassenger = (data: PassengerCreateRequest): Promise<string> =>
  request.post<string>('/api/account/front/passenger', data)

export const deletePassenger = (id: string): Promise<void> =>
  request.del<void>(`/api/account/front/passenger/${id}`)
