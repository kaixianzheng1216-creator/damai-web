import type { AxiosRequestConfig } from 'axios'

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
