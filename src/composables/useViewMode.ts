import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { COMMON_CONFIG } from '@/constants'

export type ViewMode = 'table' | 'card'

export const useViewMode = (breakpoint: number = COMMON_CONFIG.TABLET_BREAKPOINT) => {
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < breakpoint)
  const viewMode = computed<ViewMode>(() => (isMobile.value ? 'card' : 'table'))

  return {
    isMobile,
    viewMode,
  }
}
