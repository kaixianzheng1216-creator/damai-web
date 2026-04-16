import type { AxiosRequestConfig } from 'axios'

export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean
  rawResponse?: boolean
}

export interface PaginatedResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  totalPage?: number
  totalRow?: number
}
