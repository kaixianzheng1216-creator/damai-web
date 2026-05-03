import { type Ref, type ComputedRef } from 'vue'
import { useAppConfirmDialog } from '@/composables/common/useAppConfirmDialog'
import { useBannerList } from './useBannerList'
import { useBannerDialog } from './useBannerDialog'
import type { BannerCreateRequest, BannerUpdateRequest, BannerVO, CityVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

export function useBannerListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchTitle: Ref<string>
  searchCityId: Ref<string>
  citiesData: Ref<CityVO[] | undefined>
  citiesMap: ComputedRef<Map<string, CityVO>>
  isLoading: Ref<boolean>
  list: ComputedRef<BannerVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: BannerCreateRequest & { sortOrder?: number }
  dialogTitle: ComputedRef<string>
  dialogDescription: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: BannerCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: BannerUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  openCreate: () => void
  openEdit: (row: BannerVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (row: BannerVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useAppConfirmDialog()

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
