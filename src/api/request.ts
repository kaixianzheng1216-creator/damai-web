import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import router from '@/router'
import { REQUEST_CONFIG } from '@/constants'
import type { ApiCode, ApiResponse } from '@/types/api'
import type { RequestConfig } from './types'
import { normalizeResponseFields, transformDateTimeFields } from './requestTransforms'

const AUTH_FAIL_CODE = '10002'

type InternalRequestConfig = InternalAxiosRequestConfig &
  Pick<RequestConfig, 'rawResponse' | 'showError'>

interface ApiRequestErrorOptions {
  code?: ApiCode
  response?: ApiResponse<unknown>
  status?: number
}

export class ApiRequestError extends Error {
  code?: ApiCode
  response?: ApiResponse<unknown>
  status?: number

  constructor(message: string, options: ApiRequestErrorOptions = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = options.code
    this.response = options.response
    this.status = options.status
  }
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  const record = value as Record<string, unknown>
  return 'code' in record && (typeof record.code === 'string' || typeof record.code === 'number')
}

function isSuccessCode(code: ApiCode | undefined): boolean {
  return String(code) === '0'
}

function getResponseMessage(response: ApiResponse<unknown>): string {
  return response.message || '操作失败'
}

function handleAuthFailure(config: InternalRequestConfig) {
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const url = config.url || ''

  if (url.includes('/admin/')) {
    adminStore.clearAdminInfo()
    void router.push({
      name: 'admin-login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
    return
  }

  userStore.clearUserInfo()
  void router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
}

function unwrapApiResponse<T>(res: AxiosResponse<unknown>): T {
  const { data, config, status } = res
  const requestConfig = config as InternalRequestConfig

  if (!isApiResponse(data)) {
    return normalizeResponseFields(data) as T
  }

  if (isSuccessCode(data.code)) {
    const responseData = requestConfig.rawResponse ? data : data.data
    return normalizeResponseFields(responseData) as T
  }

  if (String(data.code) === AUTH_FAIL_CODE) {
    handleAuthFailure(requestConfig)
  } else if (requestConfig.showError !== false) {
    toast.error(getResponseMessage(data))
  }

  throw new ApiRequestError(getResponseMessage(data), {
    code: data.code,
    response: data,
    status,
  })
}

function handleRequestError(error: unknown): never {
  if (error instanceof ApiRequestError) {
    throw error
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    const requestConfig = axiosError.config as RequestConfig | undefined
    const message = axiosError.message || '服务异常'

    if (requestConfig?.showError !== false) {
      toast.error('服务异常')
    }

    throw new ApiRequestError(message, {
      status: axiosError.response?.status,
    })
  }

  throw error
}

function send<T>(promise: Promise<AxiosResponse<unknown>>): Promise<T> {
  return promise.then(unwrapApiResponse<T>).catch(handleRequestError)
}

const service: AxiosInstance = axios.create({
  baseURL: '',
  timeout: REQUEST_CONFIG.DEFAULT_TIMEOUT_MS,
})

service.interceptors.request.use((config: InternalRequestConfig) => {
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const url = config.url || ''

  if (url.includes('/admin/')) {
    if (adminStore.adminToken) {
      config.headers.set('Authorization-Admin', `Bearer ${adminStore.adminToken}`)
    }
  } else if (url.includes('/front/')) {
    if (userStore.token) {
      config.headers.set('Authorization-User', `Bearer ${userStore.token}`)
    }
  }

  if (config.data && !(config.data instanceof FormData)) {
    config.data = transformDateTimeFields(config.data)
  }

  return config
})

export const request = {
  get: <T = unknown>(url: string, config?: RequestConfig): Promise<T> =>
    send<T>(service.get<ApiResponse<T>>(url, config)),

  post: <T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> =>
    send<T>(service.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config)),

  put: <T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> =>
    send<T>(service.put<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config)),

  patch: <T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> =>
    send<T>(service.patch<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config)),

  del: <T = unknown>(url: string, config?: RequestConfig): Promise<T> =>
    send<T>(service.delete<ApiResponse<T>>(url, config)),
}

export const uploadFormData = <T = unknown>(url: string, file: File): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  return send<T>(
    service.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, FormData>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}

export default service
