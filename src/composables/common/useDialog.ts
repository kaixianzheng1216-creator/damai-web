import type { Ref, ShallowRef } from 'vue'
import { ref, shallowRef } from 'vue'

export interface UseDialogOptions<T = unknown> {
  onOpen?: (data?: T) => void
  onClose?: () => void
}

export interface UseDialogReturn<T> {
  open: Ref<boolean>
  data: ShallowRef<T | undefined>
  isLoading: Ref<boolean>
  openDialog: (payload?: T) => void
  closeDialog: () => void
  withLoading: (fn: () => Promise<void>) => Promise<void>
}

export function useDialog<T = unknown>(options: UseDialogOptions<T> = {}): UseDialogReturn<T> {
  const open = ref(false)
  const data = shallowRef<T>()
  const isLoading = ref(false)

  const openDialog = (payload?: T) => {
    data.value = payload
    open.value = true
    options.onOpen?.(payload)
  }

  const closeDialog = () => {
    open.value = false
    options.onClose?.()
  }

  const withLoading = async (fn: () => Promise<void>) => {
    isLoading.value = true
    try {
      await fn()
    } finally {
      isLoading.value = false
    }
  }

  return {
    open,
    data,
    isLoading,
    openDialog,
    closeDialog,
    withLoading,
  }
}
