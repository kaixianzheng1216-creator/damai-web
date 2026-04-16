import type { LoginResponse } from '@/api/account'
import type { UserInfo } from '@/stores/user'
import { useUserStore } from '@/stores/user'

const toUserInfo = (auth: LoginResponse): UserInfo => ({
  id: auth.user.id,
  username: auth.user.username,
  mobile: auth.user.mobile,
  avatarUrl: auth.user.avatarUrl,
  status: auth.user.status,
  statusLabel: auth.user.statusLabel,
})

export const useAuthSession = () => {
  const userStore = useUserStore()

  const saveSession = (auth: LoginResponse) => {
    userStore.setUserInfo(toUserInfo(auth), auth.token)
  }

  return {
    saveSession,
  }
}
