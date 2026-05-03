import { shallowRef, reactive, computed, watch, type UnwrapNestedRefs } from 'vue'
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/vue-query'
import { useAppConfirmDialog } from '@/composables/common/useAppConfirmDialog'
import { ADMIN_CRUD_COPY } from '@/constants'
import type { PaginatedResponse } from '@/api/types'

export type AdminCrudId = string

export interface AdminPageParams {
  page?: number
  size?: number
  name?: string
  [key: string]: unknown
}

type FormCb<TForm, TResult> = (form: Readonly<UnwrapNestedRefs<TForm>>) => TResult

export function useAdminCrud<
  TItem extends { id: AdminCrudId },
  TForm extends object,
  TCreateRequest = TForm,
  TUpdateRequest = Partial<TForm>,
>(options: {
  queryKeyBase: QueryKey
  fetchPage: (params: AdminPageParams) => Promise<PaginatedResponse<TItem>>
  createItem: (data: TCreateRequest) => Promise<unknown>
  updateItem: (id: AdminCrudId, data: TUpdateRequest) => Promise<unknown>
  deleteItem: (id: AdminCrudId) => Promise<unknown>
  initialForm: TForm
  defaultPageSize?: number
  getDeleteConfirmMessage?: (item: TItem) => { title: string; description: string }
  extraSearchParams?: MaybeRefOrGetter<Record<string, unknown>>
}) {
  const {
    queryKeyBase,
    fetchPage,
    createItem,
    updateItem,
    deleteItem,
    initialForm,
    defaultPageSize = 10,
    getDeleteConfirmMessage,
    extraSearchParams,
  } = options

  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useAppConfirmDialog()

  const currentPage = shallowRef(1)
  const pageSize = shallowRef(defaultPageSize)
  const searchName = shallowRef('')

  const extraParamsValue = computed<Record<string, unknown>>(() => {
    if (!extraSearchParams) return {}
    return (toValue(extraSearchParams) as Record<string, unknown> | null | undefined) ?? {}
  })

  const queryKey = computed(() => [
    ...queryKeyBase,
    currentPage.value,
    pageSize.value,
    searchName.value,
    ...Object.values(extraParamsValue.value),
  ])

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      fetchPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
        ...extraParamsValue.value,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => data.value?.totalRow ?? 0)
  const totalPages = computed(() => data.value?.totalPage ?? 1)

  const showDialog = shallowRef(false)
  const editingId = shallowRef<AdminCrudId | null>(null)
  const form = reactive({ ...initialForm }) as UnwrapNestedRefs<TForm>

  const dialogTitle = computed(() =>
    editingId.value ? ADMIN_CRUD_COPY.edit : ADMIN_CRUD_COPY.create,
  )

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
    const values = mapItemToForm
      ? mapItemToForm(item)
      : Object.keys(initialForm).reduce<Partial<TForm>>((acc, key) => {
          const record = item as Record<string, unknown>
          return key in record ? { ...acc, [key]: record[key] } : acc
        }, {})
    Object.assign(form, values)
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
    mutationFn: ({ id, data }: { id: AdminCrudId; data: TUpdateRequest }) => updateItem(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  })

  watch([searchName, extraParamsValue], () => {
    currentPage.value = 1
  })

  const handleSubmit = async (opts: {
    validate?: () => boolean | Promise<boolean>
    getCreateData: FormCb<TForm, TCreateRequest>
    getUpdateData: FormCb<TForm, TUpdateRequest>
  }) => {
    if (opts.validate && !(await opts.validate())) return

    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: opts.getUpdateData(form),
      })
    } else {
      await createMutation.mutateAsync(opts.getCreateData(form))
    }
  }

  const handleDelete = (item: TItem) => {
    const { title, description } = getDeleteConfirmMessage
      ? getDeleteConfirmMessage(item)
      : {
          title: ADMIN_CRUD_COPY.confirmDeleteTitle,
          description: ADMIN_CRUD_COPY.confirmDeleteDescription,
        }

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
