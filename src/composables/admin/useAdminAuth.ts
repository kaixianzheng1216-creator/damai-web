import type { LoginResponse } from '@/api/account'
import { useAdminStore } from '@/stores/admin'

export const useAdminAuth = () => {
  const adminStore = useAdminStore()

  const saveAdminSession = (auth: LoginResponse) => {
    adminStore.setAdminInfo(
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
