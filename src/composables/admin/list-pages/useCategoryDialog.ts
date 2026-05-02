import { computed, reactive, ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createCategory, deleteCategory, updateCategory } from '@/api/event/category'
import type { CategoryCreateRequest, CategoryUpdateRequest, CategoryVO } from '@/api/event'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { useCategoryTree } from './useCategoryTree'

export function useCategoryDialog(tree: ReturnType<typeof useCategoryTree>) {
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive({ name: '', sortOrder: 0 })

  const showChildDialog = ref(false)
  const editingChildId = ref<string | null>(null)
  const childForm = reactive({ name: '', sortOrder: 0 })

  const dialogTitle = computed(() => (editingId.value ? '编辑分类' : '新建分类'))
  const childDialogTitle = computed(() => (editingChildId.value ? '编辑子分类' : '新建子分类'))

  const resetForm = () => {
    form.name = ''
    form.sortOrder = 0
  }
  const resetChildForm = () => {
    childForm.name = ''
    childForm.sortOrder = 0
  }

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }
  const openEdit = (row: CategoryVO) => {
    form.name = row.name
    form.sortOrder = row.sortOrder
    editingId.value = row.id
    showDialog.value = true
  }
  const openCreateChild = () => {
    resetChildForm()
    editingChildId.value = null
    showChildDialog.value = true
  }
  const openEditChild = (row: CategoryVO) => {
    childForm.name = row.name
    childForm.sortOrder = row.sortOrder
    editingChildId.value = row.id
    showChildDialog.value = true
  }

  const createMutation = useMutation({
    mutationFn: (payload: CategoryCreateRequest) => createCategory(payload),
    onSuccess: () => {
      tree.invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      tree.invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: tree.invalidate,
  })

  const createChildMutation = useMutation({
    mutationFn: (payload: CategoryCreateRequest) => createCategory(payload),
    onSuccess: () => {
      tree.invalidateAndSyncParent()
      showChildDialog.value = false
    },
  })

  const updateChildMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      tree.invalidateAndSyncParent()
      showChildDialog.value = false
    },
  })

  const deleteChildMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: tree.invalidateAndSyncParent,
  })

  const handleSubmit = async () => {
    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: { name: form.name || undefined, sortOrder: form.sortOrder },
      })
      return
    }
    if (!form.name) {
      toast.error('请填写分类名称')
      return
    }
    await createMutation.mutateAsync({ name: form.name, parentId: '0', sortOrder: form.sortOrder })
  }

  const handleChildSubmit = async () => {
    if (!tree.selectedParent.value) return
    if (editingChildId.value) {
      await updateChildMutation.mutateAsync({
        id: editingChildId.value,
        data: { name: childForm.name || undefined, sortOrder: childForm.sortOrder },
      })
      return
    }
    if (!childForm.name) {
      toast.error('请填写子分类名称')
      return
    }
    await createChildMutation.mutateAsync({
      name: childForm.name,
      parentId: tree.selectedParent.value.id,
      sortOrder: childForm.sortOrder,
    })
  }

  const handleDelete = (row: CategoryVO) => {
    openConfirm('确认删除', `确认删除分类「${row.name}」？`, () =>
      deleteMutation.mutateAsync(row.id),
    )
  }

  const handleDeleteChild = (row: CategoryVO) => {
    openConfirm('确认删除', `确认删除子分类「${row.name}」？`, () =>
      deleteChildMutation.mutateAsync(row.id),
    )
  }

  return {
    showDialog,
    editingId,
    form,
    showChildDialog,
    editingChildId,
    childForm,
    dialogTitle,
    childDialogTitle,
    createMutation,
    updateMutation,
    createChildMutation,
    updateChildMutation,
    openCreate,
    openEdit,
    openCreateChild,
    openEditChild,
    handleSubmit,
    handleChildSubmit,
    handleDelete,
    handleDeleteChild,
    confirmDialog,
    closeConfirm,
    handleConfirm,
  }
}
