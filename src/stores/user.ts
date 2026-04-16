export interface UserInfo {
  id: string
  username: string
  nickname?: string
  avatarUrl: string
  mobile: string
  status?: number
  statusLabel?: string
  token?: string
}

export interface AdminInfo {
  id: string
  username: string
  mobile: string
  avatarUrl: string
  status: number
  statusLabel: string
}

export const useUserStore = defineStore('user', () => {
  const token = useStorage<string | null>('token', null)
  const userInfo = ref<UserInfo | null>(null)

  const adminToken = useStorage<string | null>('admin-token', null)
  const adminInfo = ref<AdminInfo | null>(null)

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

  const setAdminInfo = (data: AdminInfo, newToken: string) => {
    adminInfo.value = data
    adminToken.value = newToken
  }

  const clearAdminInfo = () => {
    adminInfo.value = null
    adminToken.value = null
  }

  return {
    userInfo,
    token,
    adminInfo,
    adminToken,
    isLoggedIn,
    userToken,
    setUserInfo,
    clearUserInfo,
    setAdminInfo,
    clearAdminInfo,
  }
})
