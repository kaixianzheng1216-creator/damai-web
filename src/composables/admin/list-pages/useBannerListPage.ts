import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { useBannerList } from './useBannerList'
import { useBannerDialog } from './useBannerDialog'

export function useBannerListPage() {
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const {
    currentPage,
    pageSize,
    searchTitle,
    searchCityId,
    citiesData,
    citiesMap,
    isLoading,
    list,
    totalRow,
    totalPages,
    invalidate,
  } = useBannerList()

  const {
    showDialog,
    editingId,
    form,
    dialogTitle,
    dialogDescription,
    createMutation,
    updateMutation,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
  } = useBannerDialog(invalidate, openConfirm)

  return {
    currentPage,
    pageSize,
    searchTitle,
    searchCityId,
    citiesData,
    citiesMap,
    isLoading,
    list,
    totalRow,
    totalPages,
    showDialog,
    editingId,
    form,
    dialogTitle,
    dialogDescription,
    confirmDialog,
    createMutation,
    updateMutation,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    closeConfirm,
    handleConfirm,
  }
}
