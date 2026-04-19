import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import { uploadFile } from '@/api/file'
import { AVATAR_PLACEHOLDERS } from '@/constants'

export const useAvatarUpload = () => {
  const userStore = useUserStore()
  const avatarUrl = ref('')
  const uploading = ref(false)

  const displayAvatar = computed(
    () => avatarUrl.value || userStore.userInfo?.avatarUrl || AVATAR_PLACEHOLDERS.LARGE,
  )

  const updateAvatar = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    uploading.value = true
    try {
      const url = await uploadFile(file)
      avatarUrl.value = url

      if (userStore.userInfo && userStore.userToken) {
        userStore.setUserInfo(
          {
            ...userStore.userInfo,
            avatarUrl: url,
          },
          userStore.userToken,
        )
      }
    } catch {
      toast.error('头像上传失败，请重试')
    } finally {
      uploading.value = false
    }
  }

  return {
    avatarUrl,
    displayAvatar,
    uploading,
    updateAvatar,
  }
}
