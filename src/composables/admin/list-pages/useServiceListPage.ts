import { type Ref, type ComputedRef } from 'vue'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { useServiceList } from './useServiceList'
import { useServiceDialog } from './useServiceDialog'
import { useServiceOptions } from './useServiceOptions'
import type {
  ServiceGuaranteeCreateRequest,
  ServiceGuaranteeOptionVO,
  ServiceGuaranteeUpdateRequest,
  ServiceGuaranteeVO,
  ServiceOptionCreateRequest,
  ServiceOptionUpdateRequest,
} from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useConfirmDialog'

export function useServiceListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<ServiceGuaranteeVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  selectedService: Ref<ServiceGuaranteeVO | null>
  currentOptions: ComputedRef<ServiceGuaranteeVO['options']>
  showServiceDialog: Ref<boolean>
  showOptionsDialog: Ref<boolean>
  showOptionDialog: Ref<boolean>
  serviceForm: { name: string; sortOrder?: number }
  serviceDialogTitle: ComputedRef<string>
  optionForm: { name: string; description?: string; isBooleanType?: number }
  optionDialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createServiceMutation: {
    mutateAsync: (data: ServiceGuaranteeCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateServiceMutation: {
    mutateAsync: (vars: { id: string; data: ServiceGuaranteeUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  createOptionMutation: {
    mutateAsync: (data: ServiceOptionCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateOptionMutation: {
    mutateAsync: (vars: { optionId: string; data: ServiceOptionUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  openCreateService: () => void
  openEditService: (row: ServiceGuaranteeVO) => void
  openManageOptions: (row: ServiceGuaranteeVO) => void
  openCreateOption: () => void
  openEditOption: (row: ServiceGuaranteeOptionVO) => void
  handleServiceSubmit: () => Promise<void>
  handleDeleteService: (row: ServiceGuaranteeVO) => void
  handleOptionSubmit: () => Promise<void>
  handleDeleteOption: (row: ServiceGuaranteeOptionVO) => void
  setOptionBooleanType: (checked: boolean | 'indeterminate') => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
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
