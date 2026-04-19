import { ref, reactive, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

export interface UseAdminCrudOptions<TItem, TCreateRequest, TUpdateRequest> {
  queryKeyBase: string
  fetchPage: (params: any) => Promise<any>
  createItem: (data: any) => Promise<any>
  updateItem: (id: string, data: any) => Promise<any>
  deleteItem: (id: string) => Promise<any>
  initialForm: any
  defaultPageSize?: number
  getDeleteConfirmMessage?: (item: TItem) => { title: string; description: string }
}

export function useAdminCrud<TItem extends { id: string }>(
  options: UseAdminCrudOptions<TItem, any, any>,
) {
  const {
    queryKeyBase,
    fetchPage,
    createItem,
    updateItem,
    deleteItem,
    initialForm,
    defaultPageSize = 10,
    getDeleteConfirmMessage,
  } = options

  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const searchName = ref('')

  const queryKey = computed(() => [
    queryKeyBase,
    currentPage.value,
    pageSize.value,
    searchName.value,
  ])

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      fetchPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => data.value?.totalRow ?? 0)
  const totalPages = computed(() => data.value?.totalPage ?? 1)

  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive({ ...initialForm })

  const dialogTitle = computed(() => (editingId.value ? '编辑' : '新建'))

  const resetForm = () => {
    Object.assign(form, { ...initialForm })
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKeyBase] })

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }

  const openEdit = (item: TItem, mapItemToForm?: (item: TItem) => any) => {
    resetForm()
    if (mapItemToForm) {
      Object.assign(form, mapItemToForm(item))
    } else {
      Object.assign(form, item)
    }
    editingId.value = item.id
    showDialog.value = true
  }

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateItem(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  })

  watch(searchName, () => {
    currentPage.value = 1
  })

  const handleSubmit = async (options?: {
    validate?: () => boolean | Promise<boolean>
    getCreateData?: () => any
    getUpdateData?: () => any
  }) => {
    const { validate, getCreateData, getUpdateData } = options ?? {}

    if (validate && !(await validate())) {
      return
    }

    if (editingId.value) {
      const updateData = getUpdateData ? getUpdateData() : form
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: updateData,
      })
    } else {
      const createData = getCreateData ? getCreateData() : form
      await createMutation.mutateAsync(createData)
    }
  }

  const handleDelete = (item: TItem) => {
    const { title, description } = getDeleteConfirmMessage
      ? getDeleteConfirmMessage(item)
      : { title: '确认删除', description: '确认删除该项目？' }

    openConfirm(title, description, () => deleteMutation.mutate(item.id))
  }

  return {
    currentPage,
    pageSize,
    searchName,
    data,
    isLoading,
    refetch,
    list,
    totalRow,
    totalPages,
    showDialog,
    editingId,
    form,
    dialogTitle,
    confirmDialog,
    createMutation,
    updateMutation,
    deleteMutation,
    resetForm,
    invalidate,
    openCreate,
    openEdit,
    closeConfirm,
    handleConfirm,
    handleSubmit,
    handleDelete,
  }
}
