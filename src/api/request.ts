import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import dayjs from 'dayjs'

const AUTH_FAIL_CODE = '10002'

// 转换 datetime-local 格式 (YYYY-MM-DDTHH:mm) 为 ISO 8601 格式
function transformDateTimeFields(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(transformDateTimeFields)
  }

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      // 转换 datetime-local 格式为 ISO 8601
      result[key] = dayjs(value).toISOString()
    } else {
      result[key] = transformDateTimeFields(value)
    }
  }
  return result
}

const service = axios.create({
  baseURL: '',
  timeout: 10000,
})

service.interceptors.request.use((config: any) => {
  const userStore = useUserStore()
  const url = config.url || ''

  if (url.includes('/admin/')) {
    if (userStore.adminToken)
      config.headers['Authorization-Admin'] = `Bearer ${userStore.adminToken}`
  } else if (url.includes('/front/')) {
    if (userStore.token) config.headers['Authorization-User'] = `Bearer ${userStore.token}`
  }

  // 转换请求数据中的日期时间字段
  if (config.data) {
    config.data = transformDateTimeFields(config.data)
  }

  return config
})

service.interceptors.response.use(
  (res: any) => {
    const { data, config } = res

    if (data.code === '0' || data.code === 0) return config.rawResponse ? data : data.data

    if (String(data.code) === AUTH_FAIL_CODE) {
      const userStore = useUserStore()
      const url = config.url || ''

      if (url.includes('/admin/')) {
        userStore.clearAdminInfo()
        router.push({
          name: 'admin-login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      } else {
        userStore.clearUserInfo()
        router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
      }
    } else if (config.showError !== false) {
      toast.error(data.message || '操作失败')
    }

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
