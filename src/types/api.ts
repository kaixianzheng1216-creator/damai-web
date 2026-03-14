import { z } from 'zod'

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

export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ code: z.number(), message: z.string(), data })

export const paginatedResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    list: z.array(item),
    total: z.number(),
    pageNum: z.number(),
    pageSize: z.number(),
  })
