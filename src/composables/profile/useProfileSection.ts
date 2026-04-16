import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PROFILE_SECTIONS, type ProfileSectionKey } from '@/constants'

export const useProfileSection = () => {
  const route = useRoute()
  const router = useRouter()

  const activeSection = ref<ProfileSectionKey>('info')

  const profileSections = computed(() => PROFILE_SECTIONS)
  const tradeSections = computed(() =>
    profileSections.value.filter((item) => item.group === 'trade'),
  )
  const accountSections = computed(() =>
    profileSections.value.filter((item) => item.group === 'account'),
  )
  const sectionKeys = computed(() => new Set(profileSections.value.map((item) => item.key)))
  const currentTitle = computed(
    () =>
      profileSections.value.find((item) => item.key === activeSection.value)?.label ?? '个人信息',
  )

  watch(
    () => route.query.section,
    (section) => {
      if (typeof section !== 'string') {
        return
      }

      if (sectionKeys.value.has(section as ProfileSectionKey)) {
        activeSection.value = section as ProfileSectionKey
      }
    },
    { immediate: true },
  )

  const openSection = async (section: ProfileSectionKey) => {
    activeSection.value = section
    await router.replace({
      path: route.path,
      query: {
        ...route.query,
        section,
      },
    })
  }

  return {
    activeSection,
    profileSections,
    tradeSections,
    accountSections,
    currentTitle,
    openSection,
  }
}
