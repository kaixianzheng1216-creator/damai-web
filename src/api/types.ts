import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'

export type { ApiResponse }

export type EntityId = string

export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean
  rawResponse?: boolean
}

export interface PaginatedResponse<T> {
  pageNumber: number
  pageSize: number
  totalRow: number
  totalPage: number
  records: T[]
}
