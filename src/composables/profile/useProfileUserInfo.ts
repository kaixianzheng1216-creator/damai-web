import { reactive, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchUserInfo, updateUserInfo } from '@/api/account'
import type { UserVO } from '@/api/account'
import { PROFILE_CONFIG, queryKeys } from '@/constants'
import { useAvatarUpload } from './useAvatarUpload'

export const useProfileUserInfo = () => {
  const queryClient = useQueryClient()
  const avatarUpload = useAvatarUpload()

  const userInfoQuery = useQuery<UserVO>({
    queryKey: queryKeys.profile.userInfo(),
    queryFn: fetchUserInfo,
  })

  const updateUserInfoMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.userInfo() })
    },
  })

  const years = Array.from({ length: PROFILE_CONFIG.YEAR_RANGE }, (_, i) =>
    String(PROFILE_CONFIG.START_YEAR - i),
  )
  const months = Array.from({ length: PROFILE_CONFIG.MONTH_COUNT }, (_, i) => String(i + 1))
  const days = Array.from({ length: PROFILE_CONFIG.DAY_COUNT }, (_, i) => String(i + 1))

  const infoForm = reactive({
    nickname: userInfoQuery.data.value?.username ?? '',
    gender: PROFILE_CONFIG.GENDER_DEFAULT,
    birthYear: PROFILE_CONFIG.BIRTH_YEAR_DEFAULT,
    birthMonth: PROFILE_CONFIG.BIRTH_MONTH_DEFAULT,
    birthDay: PROFILE_CONFIG.BIRTH_DAY_DEFAULT,
  })

  watch(
    () => userInfoQuery.data.value,
    (data) => {
      if (!data) {
        return
      }
      infoForm.nickname = data.username
    },
    { immediate: true },
  )

  const saveInfo = async () => {
    await updateUserInfoMutation.mutateAsync({
      username: infoForm.nickname,
      avatarUrl: avatarUpload.avatarUrl.value || userInfoQuery.data.value?.avatarUrl,
    })
  }

  return {
    infoForm,
    saveInfo,
    years,
    months,
    days,
    userInfoQuery,
    updateUserInfoMutation,
    displayAvatar: avatarUpload.displayAvatar,
    updateAvatar: avatarUpload.updateAvatar,
  }
}
