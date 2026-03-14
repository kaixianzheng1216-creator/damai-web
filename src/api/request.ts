import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/stores/user'
import type { RequestConfig } from './types'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

service.interceptors.request.use(
  (config) => {
    const { token } = useUserStore()

    if (token) config.headers.Authorization = `Bearer ${token}`

    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => {
    const { data, config } = res
    const { rawResponse = false, showError = true } = config as RequestConfig

    if (data.code === 200) return (rawResponse ? data : data.data) as unknown as AxiosResponse

    if (showError) MessagePlugin.error(data.message || '操作失败')

    return Promise.reject(new Error())
  },
  (err: AxiosError<ApiResponse>) => {
    MessagePlugin.error('网络异常')

    return Promise.reject(err)
  },
)

export const request = {
  get: <T>(url: string, config?: RequestConfig) => service.get<unknown, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    service.post<unknown, T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    service.put<unknown, T>(url, data, config),
  del: <T>(url: string, config?: RequestConfig) => service.delete<unknown, T>(url, config),
}

export default service
