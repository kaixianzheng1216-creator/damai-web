import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export interface AdminInfo {
  id: string
  username: string
  mobile: string
  avatarUrl: string
  status: number
  statusLabel: string
}

export const useAdminStore = defineStore('admin', () => {
  const adminToken = useStorage<string | null>('admin-token', null)
  const adminInfo = useStorage<AdminInfo | null>('admin-info', null)

  const setAdminInfo = (data: AdminInfo, newToken: string) => {
    adminInfo.value = data
    adminToken.value = newToken
  }

  const clearAdminInfo = () => {
    adminInfo.value = null
    adminToken.value = null
  }

  return {
    adminInfo,
    adminToken,
    setAdminInfo,
    clearAdminInfo,
  }
})
