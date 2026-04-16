import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

service.interceptors.request.use((config: any) => {
  const { token } = useUserStore()

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

service.interceptors.response.use(
  (res: any) => {
    const { data, config } = res

    if (data.code === 200) return config.rawResponse ? data : data.data

    if (config.showError !== false) toast.error(data.message || '操作失败')

    return Promise.reject(data)
  },
  (err) => {
    toast.error('服务异常')

    return Promise.reject(err)
  },
)

export const request = {
  get: <T = any>(url: string, config?: any): Promise<T> => service.get(url, config),

  post: <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    service.post(url, data, config),

  put: <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    service.put(url, data, config),

  del: <T = any>(url: string, config?: any): Promise<T> => service.delete(url, config),
}

export const uploadFormData = <T = any>(url: string, file: File): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  return service.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export default service
