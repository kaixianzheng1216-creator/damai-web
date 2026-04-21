import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

export const useViewMode = (breakpoint: number = 1024) => {
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < breakpoint)
  const viewMode = computed(() => (isMobile.value ? 'card' : 'table'))

  return {
    isMobile,
    viewMode,
  }
}
