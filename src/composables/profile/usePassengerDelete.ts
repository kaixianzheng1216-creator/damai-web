import { ref, type Ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { useRefreshPassengerList } from './usePassengerRefresh'
import { deletePassenger } from '@/api/account'
import { useDialog } from '@/composables/common'

export interface UsePassengerDeleteOptions {
  errorRef: Ref<string>
}

export const usePassengerDelete = (options: UsePassengerDeleteOptions) => {
  const {
    open: showDeletePassengerModal,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDialog()

  const deletingPassengerId = ref<string | null>(null)

  const refreshPassengerList = useRefreshPassengerList()

  const deletePassengerMutation = useMutation({
    mutationFn: deletePassenger,
    onSuccess: refreshPassengerList,
    onError: () => {
      options.errorRef.value = '删除失败，请重试'
    },
  })

  const openDeletePassengerModal = (passengerId: string) => {
    deletingPassengerId.value = passengerId
    openDeleteDialog()
  }

  const closeDeletePassengerModal = () => {
    closeDeleteDialog()
    deletingPassengerId.value = null
  }

  const confirmDeletePassenger = async () => {
    if (deletingPassengerId.value == null) {
      return
    }

    await deletePassengerMutation.mutateAsync(deletingPassengerId.value)
    closeDeletePassengerModal()
  }

  return {
    showDeletePassengerModal,
    deletingPassengerId,
    openDeletePassengerModal,
    closeDeletePassengerModal,
    confirmDeletePassenger,
    deletePassengerMutation,
  }
}
