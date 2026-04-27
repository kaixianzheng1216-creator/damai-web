import { computed, reactive, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createNotice, deleteNotice, fetchAdminNoticesPage, updateNotice } from '@/api/event/notice'
import type { NoticeCreateRequest, NoticeUpdateRequest, NoticeVO } from '@/api/event'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

type NoticeForm = {
  type: number
  name: string
  sortOrder: number | undefined
}

const adminNoticesQueryKey = ['admin-notices']

export function useNoticeListPage() {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchName = ref('')
  const searchType = ref('')

  const queryKey = computed(() => [
    ...adminNoticesQueryKey,
    currentPage.value,
    pageSize.value,
    searchName.value,
    searchType.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminNoticesPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
        type: searchType.value && searchType.value !== 'all' ? Number(searchType.value) : undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive<NoticeForm>({
    type: 1,
    name: '',
    sortOrder: undefined,
  })

  const dialogTitle = computed(() => (editingId.value ? '编辑须知' : '新建须知'))

  const resetForm = () => {
    form.type = 1
    form.name = ''
    form.sortOrder = undefined
  }

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }

  const openEdit = (row: NoticeVO) => {
    form.type = row.type
    form.name = row.name
    form.sortOrder = row.sortOrder
    editingId.value = row.id
    showDialog.value = true
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminNoticesQueryKey })

  const createMutation = useMutation({
    mutationFn: (payload: NoticeCreateRequest) => createNotice(payload),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoticeUpdateRequest }) => updateNotice(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotice(id),
    onSuccess: invalidate,
  })

  watch([searchName, searchType], () => {
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
      type: form.type,
      name: form.name,
      sortOrder: form.sortOrder,
    })
  }

  const handleDelete = (row: NoticeVO) => {
    openConfirm('确认删除', `确认删除须知「${row.name}」？`, () =>
      deleteMutation.mutateAsync(row.id),
    )
  }

  return {
    currentPage,
    pageSize,
    searchName,
    searchType,
    isLoading,
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
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    closeConfirm,
    handleConfirm,
  }
}
