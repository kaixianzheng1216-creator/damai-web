import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export function createAuthStore<T>(tokenKey: string, infoKey: string) {
  const token = useStorage<string | null>(tokenKey, null)
  const info = useStorage<T | null>(infoKey, null)
  const isLoggedIn = computed(() => Boolean(token.value))

  return { token, info, isLoggedIn }
}
