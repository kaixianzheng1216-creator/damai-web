import { defineStore } from 'pinia'
import { createAuthStore } from '@/composables/common/useAuthStore'

export interface AdminInfo {
  id: string
  username: string
  mobile: string
  avatarUrl: string
  status: number
  statusLabel: string
}

export const useAdminStore = defineStore('admin', () => {
  const {
    token: adminToken,
    info: adminInfo,
    isLoggedIn,
  } = createAuthStore<AdminInfo>('admin-token', 'admin-info')

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
    isLoggedIn,
    setAdminInfo,
    clearAdminInfo,
  }
})
