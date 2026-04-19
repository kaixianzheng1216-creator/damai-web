import { ref } from 'vue'

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  confirmText?: string
  onConfirm: () => void
}

export function useConfirmDialog() {
  const confirmDialog = ref<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    confirmText: undefined,
    onConfirm: () => {},
  })

  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText?: string,
  ) => {
    confirmDialog.value = {
      open: true,
      title,
      description,
      confirmText,
      onConfirm,
    }
  }

  const closeConfirm = () => {
    confirmDialog.value.open = false
  }

  const handleConfirm = () => {
    confirmDialog.value.onConfirm()
    closeConfirm()
  }

  return {
    confirmDialog,
    openConfirm,
    closeConfirm,
    handleConfirm,
  }
}
