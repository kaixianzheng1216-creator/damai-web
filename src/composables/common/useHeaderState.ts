import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/api/account'
import { fetchGroupedCities } from '@/api/event'
import {
  DEFAULT_SEARCH_QUERY,
  HEADER_PROFILE_MENU_ITEMS,
  COMMON_CONFIG,
  AVATAR_PLACEHOLDERS,
  type ProfileSectionKey,
} from '@/constants'
import { useUserStore } from '@/stores/user'
import type { CityVO } from '@/api/event'

const DEFAULT_CITY = COMMON_CONFIG.DEFAULT_CITY

export const useHeaderState = () => {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()

  const cityMenuOpen = ref(false)
  const searchQuery = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')

  const selectedCity = useStorage<string>('selected-city', DEFAULT_CITY)

  const cityOptionsQuery = useQuery({
    queryKey: ['city-options'],
    queryFn: fetchGroupedCities,
  })

  const hotCities = computed<string[]>(
    () => cityOptionsQuery.data.value?.featuredCities.map((c: CityVO) => c.name as string) ?? [],
  )
  const otherCities = computed<string[]>(
    () => cityOptionsQuery.data.value?.normalCities.map((c: CityVO) => c.name as string) ?? [],
  )
  const cityOptions = computed<string[]>(() => [...hotCities.value, ...otherCities.value])
  const displayName = computed(() => userStore.userInfo?.username || '我的')
  const avatarUrl = computed(() => userStore.userInfo?.avatarUrl || AVATAR_PLACEHOLDERS.SMALL)

  watch(
    () => route.query.keyword,
    (keyword) => {
      searchQuery.value = typeof keyword === 'string' ? keyword : ''
    },
  )

  watch(cityOptions, (options) => {
    if (!options.length) {
      return
    }

    if (!options.includes(selectedCity.value)) {
      selectedCity.value = options[0] as string
    }
  })

  watch(
    () => route.fullPath,
    () => {
      cityMenuOpen.value = false
    },
  )

  const closeCityMenu = () => {
    cityMenuOpen.value = false
  }

  const selectCity = async (city: string) => {
    selectedCity.value = city
    closeCityMenu()

    if (route.name === 'home') {
      return
    }

    if (route.name === 'category') {
      await router.push({
        name: 'category',
        query: {
          ...route.query,
          city,
          page: String(DEFAULT_SEARCH_QUERY.page),
        },
      })
    }
  }

  const openProfileSection = async (section: ProfileSectionKey) => {
    await router.push({
      name: 'profile',
      query: { section },
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 忽略登出错误，继续清除本地状态
    } finally {
      userStore.clearUserInfo()
      await router.push('/')
    }
  }

  const handleSearch = async () => {
    await router.push({
      name: 'category',
      query: {
        keyword: searchQuery.value.trim(),
        page: String(DEFAULT_SEARCH_QUERY.page),
        size: String(DEFAULT_SEARCH_QUERY.size),
        cityId: undefined,
        categoryId: DEFAULT_SEARCH_QUERY.categoryId,
        timeType: DEFAULT_SEARCH_QUERY.timeType,
        sortField: DEFAULT_SEARCH_QUERY.sortField,
        sortOrder: DEFAULT_SEARCH_QUERY.sortOrder,
      },
    })
  }

  return {
    cityMenuOpen,
    selectedCity,
    searchQuery,
    hotCities,
    otherCities,
    cityOptions,
    displayName,
    avatarUrl,
    headerProfileMenuItems: HEADER_PROFILE_MENU_ITEMS,
    isLoggedIn: computed(() => userStore.isLoggedIn),
    selectCity,
    openProfileSection,
    handleLogout,
    handleSearch,
  }
}
