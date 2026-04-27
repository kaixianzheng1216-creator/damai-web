import { computed, reactive, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategoriesPage,
  updateCategory,
} from '@/api/event/category'
import type { CategoryCreateRequest, CategoryUpdateRequest, CategoryVO } from '@/api/event'
import { queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

const adminCategoriesQueryKey = queryKeys.admin.list('categories')

export function useCategoryListPage() {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchName = ref('')

  const queryKey = computed(() => [
    ...adminCategoriesQueryKey,
    currentPage.value,
    pageSize.value,
    searchName.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminCategoriesPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 0))

  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive({
    name: '',
    sortOrder: 0,
  })

  const showChildrenDialog = ref(false)
  const selectedParent = ref<CategoryVO | null>(null)
  const currentChildren = computed(() => selectedParent.value?.children ?? [])

  const showChildDialog = ref(false)
  const editingChildId = ref<string | null>(null)
  const childForm = reactive({
    name: '',
    sortOrder: 0,
  })

  const dialogTitle = computed(() => (editingId.value ? '编辑分类' : '新建分类'))
  const childDialogTitle = computed(() => (editingChildId.value ? '编辑子分类' : '新建子分类'))

  const syncSelectedParent = () => {
    if (!selectedParent.value) return
    const fresh = list.value.find((category) => category.id === selectedParent.value?.id)
    if (fresh) selectedParent.value = fresh
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey })

  const invalidateAndSyncParent = () => invalidate().then(syncSelectedParent)

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

  const openManageChildren = (row: CategoryVO) => {
    const fresh = list.value.find((category) => category.id === row.id)
    selectedParent.value = fresh ?? row
    showChildrenDialog.value = true
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
      invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  })

  const createChildMutation = useMutation({
    mutationFn: (payload: CategoryCreateRequest) => createCategory(payload),
    onSuccess: () => {
      invalidateAndSyncParent()
      showChildDialog.value = false
    },
  })

  const updateChildMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      invalidateAndSyncParent()
      showChildDialog.value = false
    },
  })

  const deleteChildMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidateAndSyncParent,
  })

  watch(searchName, () => {
    currentPage.value = 1
  })

  const handleSubmit = async () => {
    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: {
          name: form.name || undefined,
          sortOrder: form.sortOrder,
        },
      })
      return
    }

    if (!form.name) return
    await createMutation.mutateAsync({
      name: form.name,
      parentId: '0',
      sortOrder: form.sortOrder,
    })
  }

  const handleChildSubmit = async () => {
    if (!selectedParent.value) return

    if (editingChildId.value) {
      await updateChildMutation.mutateAsync({
        id: editingChildId.value,
        data: {
          name: childForm.name || undefined,
          sortOrder: childForm.sortOrder,
        },
      })
      return
    }

    if (!childForm.name) return
    await createChildMutation.mutateAsync({
      name: childForm.name,
      parentId: selectedParent.value.id,
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
    currentPage,
    pageSize,
    searchName,
    isLoading,
    list,
    totalRow,
    totalPages,
    showDialog,
    showChildrenDialog,
    showChildDialog,
    selectedParent,
    currentChildren,
    form,
    childForm,
    dialogTitle,
    childDialogTitle,
    confirmDialog,
    createMutation,
    updateMutation,
    createChildMutation,
    updateChildMutation,
    openCreate,
    openEdit,
    openManageChildren,
    openCreateChild,
    openEditChild,
    handleSubmit,
    handleChildSubmit,
    handleDelete,
    handleDeleteChild,
    closeConfirm,
    handleConfirm,
  }
}
