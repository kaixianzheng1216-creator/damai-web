import type { LoginResponse } from '@/api/account'
import { useUserStore } from '@/stores/user'

export const useAdminAuth = () => {
  const userStore = useUserStore()

  const saveAdminSession = (auth: LoginResponse) => {
    userStore.setAdminInfo(
      {
        id: String(auth.user.id),
        username: auth.user.username,
        mobile: auth.user.mobile,
        avatarUrl: auth.user.avatarUrl ?? '',
        status: auth.user.status ?? 1,
        statusLabel: auth.user.statusLabel ?? '正常',
      },
      auth.token,
    )
  }

  return { saveAdminSession }
}
