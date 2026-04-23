import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

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
  const token = useStorage<string | null>('token', null)
  const userInfo = useStorage<UserInfo | null>('user-info', null)

  const isLoggedIn = computed(() => !!token.value)
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
