import { inject, provide, type InjectionKey } from 'vue'
import type { ProfilePageState } from '@/composables/profile/useProfilePage'

const profilePageKey: InjectionKey<ProfilePageState> = Symbol('profile-page')

export function provideProfilePage(profile: ProfilePageState) {
  provide(profilePageKey, profile)
}

export function useProfilePageContext(): ProfilePageState {
  const profile = inject(profilePageKey)

  if (!profile) {
    throw new Error('Profile page context is not provided')
  }

  return profile
}
