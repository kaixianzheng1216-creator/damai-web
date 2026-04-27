import { z } from 'zod'

export type ApiCode = string | number

export interface ApiResponse<T = unknown> {
  code: ApiCode
  message: string
  data?: T
}

export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ code: z.union([z.number(), z.string()]), message: z.string(), data })
