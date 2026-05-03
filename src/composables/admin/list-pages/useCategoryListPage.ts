import { type Ref, type ComputedRef } from 'vue'
import { useCategoryTree } from './useCategoryTree'
import { useCategoryDialog } from './useCategoryDialog'
import type { CategoryCreateRequest, CategoryUpdateRequest, CategoryVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

export { useCategoryTree } from './useCategoryTree'
export { useCategoryDialog } from './useCategoryDialog'

export function useCategoryListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<CategoryVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  showChildrenDialog: Ref<boolean>
  showChildDialog: Ref<boolean>
  selectedParent: Ref<CategoryVO | null>
  currentChildren: ComputedRef<CategoryVO[]>
  form: { name: string; sortOrder: number }
  childForm: { name: string; sortOrder: number }
  dialogTitle: ComputedRef<string>
  childDialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: CategoryCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: CategoryUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  createChildMutation: {
    mutateAsync: (data: CategoryCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateChildMutation: {
    mutateAsync: (vars: { id: string; data: CategoryUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  openCreate: () => void
  openEdit: (row: CategoryVO) => void
  openManageChildren: (row: CategoryVO) => void
  openCreateChild: () => void
  openEditChild: (row: CategoryVO) => void
  handleSubmit: () => Promise<void>
  handleChildSubmit: () => Promise<void>
  handleDelete: (row: CategoryVO) => void
  handleDeleteChild: (row: CategoryVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const tree = useCategoryTree()
  const dialog = useCategoryDialog(tree)

  return {
    currentPage: tree.currentPage,
    pageSize: tree.pageSize,
    searchName: tree.searchName,
    isLoading: tree.isLoading,
    list: tree.list,
    totalRow: tree.totalRow,
    totalPages: tree.totalPages,
    showDialog: dialog.showDialog,
    showChildrenDialog: tree.showChildrenDialog,
    showChildDialog: dialog.showChildDialog,
    selectedParent: tree.selectedParent,
    currentChildren: tree.currentChildren,
    form: dialog.form,
    childForm: dialog.childForm,
    dialogTitle: dialog.dialogTitle,
    childDialogTitle: dialog.childDialogTitle,
    confirmDialog: dialog.confirmDialog,
    createMutation: dialog.createMutation,
    updateMutation: dialog.updateMutation,
    createChildMutation: dialog.createChildMutation,
    updateChildMutation: dialog.updateChildMutation,
    openCreate: dialog.openCreate,
    openEdit: dialog.openEdit,
    openManageChildren: tree.openManageChildren,
    openCreateChild: dialog.openCreateChild,
    openEditChild: dialog.openEditChild,
    handleSubmit: dialog.handleSubmit,
    handleChildSubmit: dialog.handleChildSubmit,
    handleDelete: dialog.handleDelete,
    handleDeleteChild: dialog.handleDeleteChild,
    closeConfirm: dialog.closeConfirm,
    handleConfirm: dialog.handleConfirm,
  }
}
