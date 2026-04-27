import { ref } from 'vue'

export type ConfirmDialogVariant = 'default' | 'destructive'

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  confirmText: string
  confirmVariant: ConfirmDialogVariant
  isProcessing: boolean
  onConfirm: () => void | Promise<void>
}

interface OpenConfirmOptions {
  confirmText?: string
  confirmVariant?: ConfirmDialogVariant
}

const destructivePattern = /删除|移除|关闭|下线/

const getDefaultConfirmText = (title: string) => {
  if (title.includes('删除')) return '删除'
  if (title.includes('移除')) return '移除'
  if (title.includes('关闭')) return '关闭'
  if (title.includes('下线')) return '下线'
  return '确认'
}

const getDefaultVariant = (title: string, description: string): ConfirmDialogVariant =>
  destructivePattern.test(`${title}${description}`) ? 'destructive' : 'default'

export function useConfirmDialog() {
  const confirmDialog = ref<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    confirmText: '确认',
    confirmVariant: 'default',
    isProcessing: false,
    onConfirm: () => {},
  })

  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    options?: string | OpenConfirmOptions,
  ) => {
    const normalizedOptions = typeof options === 'string' ? { confirmText: options } : options

    confirmDialog.value = {
      open: true,
      title,
      description,
      confirmText: normalizedOptions?.confirmText ?? getDefaultConfirmText(title),
      confirmVariant: normalizedOptions?.confirmVariant ?? getDefaultVariant(title, description),
      isProcessing: false,
      onConfirm,
    }
  }

  const closeConfirm = () => {
    if (confirmDialog.value.isProcessing) {
      return
    }

    confirmDialog.value.open = false
  }

  const handleConfirm = async () => {
    if (confirmDialog.value.isProcessing) {
      return
    }

    confirmDialog.value.isProcessing = true
    try {
      await confirmDialog.value.onConfirm()
      confirmDialog.value.open = false
    } catch {
      // Keep the dialog open so the user can retry after the mutation layer reports the error.
    } finally {
      confirmDialog.value.isProcessing = false
    }
  }

  return {
    confirmDialog,
    openConfirm,
    closeConfirm,
    handleConfirm,
  }
}
