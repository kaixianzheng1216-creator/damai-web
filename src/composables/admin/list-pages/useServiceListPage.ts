import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { useServiceList } from './useServiceList'
import { useServiceDialog } from './useServiceDialog'
import { useServiceOptions } from './useServiceOptions'

export function useServiceListPage() {
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const {
    currentPage,
    pageSize,
    searchName,
    isLoading,
    list,
    totalRow,
    totalPages,
    selectedService,
    currentOptions,
    invalidate,
  } = useServiceList()

  const {
    showServiceDialog,
    serviceForm,
    serviceDialogTitle,
    createServiceMutation,
    updateServiceMutation,
    openCreateService,
    openEditService,
    handleServiceSubmit,
    handleDeleteService,
  } = useServiceDialog(invalidate, openConfirm)

  const {
    showOptionsDialog,
    showOptionDialog,
    optionForm,
    optionDialogTitle,
    createOptionMutation,
    updateOptionMutation,
    openManageOptions,
    openCreateOption,
    openEditOption,
    handleOptionSubmit,
    handleDeleteOption,
    setOptionBooleanType,
  } = useServiceOptions(invalidate, selectedService, list, openConfirm)

  return {
    currentPage,
    pageSize,
    searchName,
    isLoading,
    list,
    totalRow,
    totalPages,
    selectedService,
    currentOptions,
    showServiceDialog,
    showOptionsDialog,
    showOptionDialog,
    serviceForm,
    serviceDialogTitle,
    optionForm,
    optionDialogTitle,
    confirmDialog,
    createServiceMutation,
    updateServiceMutation,
    createOptionMutation,
    updateOptionMutation,
    openCreateService,
    openEditService,
    openManageOptions,
    openCreateOption,
    openEditOption,
    handleServiceSubmit,
    handleDeleteService,
    handleOptionSubmit,
    handleDeleteOption,
    setOptionBooleanType,
    closeConfirm,
    handleConfirm,
  }
}
