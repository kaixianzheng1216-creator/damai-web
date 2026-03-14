import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
import type { ApiResponse } from '@/types/api'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    if (data.code === 200) {
      return data.data
    }

    MessagePlugin.error(data.message || 'Error')

    return Promise.reject(new Error(data.message || 'Error'))
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network Error'

    MessagePlugin.error(message)

    return Promise.reject(error)
  },
)

export default request

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  request.get(url, config)

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  request.post(url, data, config)

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  request.put(url, data, config)

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  request.delete(url, config)
