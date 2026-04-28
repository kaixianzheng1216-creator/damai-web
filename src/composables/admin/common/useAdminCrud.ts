import { shallowRef, reactive, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/vue-query'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import type { PaginatedResponse } from '@/api/types'

type AdminPageParams = {
  page?: number
  size?: number
  name?: string
}

export interface UseAdminCrudOptions<
  TItem,
  TForm extends Record<string, unknown>,
  TCreateRequest = TForm,
  TUpdateRequest = Partial<TForm>,
> {
  queryKeyBase: QueryKey
  fetchPage: (params: AdminPageParams) => Promise<PaginatedResponse<TItem>>
  createItem: (data: TCreateRequest) => Promise<unknown>
  updateItem: (id: string, data: TUpdateRequest) => Promise<unknown>
  deleteItem: (id: string) => Promise<unknown>
  initialForm: TForm
  defaultPageSize?: number
  getDeleteConfirmMessage?: (item: TItem) => { title: string; description: string }
}

interface UseAdminCrudSubmitOptions<TForm, TCreateRequest, TUpdateRequest> {
  validate?: () => boolean | Promise<boolean>
  getCreateData: (form: TForm) => TCreateRequest
  getUpdateData: (form: TForm) => TUpdateRequest
}

export function useAdminCrud<
  TItem extends { id: string },
  TForm extends Record<string, unknown>,
  TCreateRequest = TForm,
  TUpdateRequest = Partial<TForm>,
>(options: UseAdminCrudOptions<TItem, TForm, TCreateRequest, TUpdateRequest>) {
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

  const currentPage = shallowRef(1)
  const pageSize = shallowRef(defaultPageSize)
  const searchName = shallowRef('')

  const queryKey = computed(() => [
    ...queryKeyBase,
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

  const showDialog = shallowRef(false)
  const editingId = shallowRef<string | null>(null)
  const form = reactive({ ...initialForm }) as TForm

  const dialogTitle = computed(() => (editingId.value ? '编辑' : '新建'))

  const resetForm = () => {
    Object.assign(form, { ...initialForm })
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeyBase })

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }

  const openEdit = (item: TItem, mapItemToForm?: (item: TItem) => Partial<TForm>) => {
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
    mutationFn: ({ id, data }: { id: string; data: TUpdateRequest }) => updateItem(id, data),
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

  const handleSubmit = async (
    options: UseAdminCrudSubmitOptions<TForm, TCreateRequest, TUpdateRequest>,
  ) => {
    const { validate, getCreateData, getUpdateData } = options

    if (validate && !(await validate())) {
      return
    }

    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: getUpdateData(form),
      })
    } else {
      await createMutation.mutateAsync(getCreateData(form))
    }
  }

  const handleDelete = (item: TItem) => {
    const { title, description } = getDeleteConfirmMessage
      ? getDeleteConfirmMessage(item)
      : { title: '确认删除', description: '确认删除该项目？' }

    openConfirm(title, description, async () => {
      await deleteMutation.mutateAsync(item.id)
    })
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
