export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T = unknown> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}
