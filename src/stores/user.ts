import { defineStore } from 'pinia'
import { computed } from 'vue'
import { createAuthStore } from '@/composables/common/useAuthStore'

export interface UserInfo {
  id: string
  username: string
  avatarUrl: string
  mobile: string
  status?: number
  statusLabel?: string
  token?: string
}

export const useUserStore = defineStore('user', () => {
  const { token, info: userInfo, isLoggedIn } = createAuthStore<UserInfo>('token', 'user-info')

  const userToken = computed(() => token.value)

  const setUserInfo = (data: UserInfo, newToken?: string) => {
    userInfo.value = data
    if (newToken) token.value = newToken
    else if (data.token) token.value = data.token
  }

  const clearUserInfo = () => {
    userInfo.value = null
    token.value = null
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    userToken,
    setUserInfo,
    clearUserInfo,
  }
})
