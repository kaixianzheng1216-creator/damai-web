export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  mobile: string
  token?: string
}

export const useUserStore = defineStore('user', () => {
  const token = useStorage<string | null>('token', null)
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const setUserInfo = (data: UserInfo) => {
    userInfo.value = data

    if (data.token) token.value = data.token
  }

  const clearUserInfo = () => {
    userInfo.value = null
    token.value = null
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    clearUserInfo,
  }
})
