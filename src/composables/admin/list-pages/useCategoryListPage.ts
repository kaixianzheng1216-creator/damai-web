import { useCategoryTree } from './useCategoryTree'
import { useCategoryDialog } from './useCategoryDialog'
import { useCategoryDragSort } from './useCategoryDragSort'

export { useCategoryTree } from './useCategoryTree'
export { useCategoryDialog } from './useCategoryDialog'
export { useCategoryDragSort } from './useCategoryDragSort'

export function useCategoryListPage() {
  const tree = useCategoryTree()
  const dialog = useCategoryDialog(tree)
  useCategoryDragSort()

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
