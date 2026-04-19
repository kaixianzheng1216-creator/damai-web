import { z } from 'zod'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ code: z.number(), message: z.string(), data })
