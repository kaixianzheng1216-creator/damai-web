import { computed, reactive, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createAdmin, fetchAdminPage, updateAdmin, updateAdminStatus } from '@/api/account/admin'
import type { AdminCreateRequest, AdminUpdateRequest, AdminVO } from '@/api/account'
import { queryKeys, USER_STATUS } from '@/constants'

const adminListQueryKey = queryKeys.admin.list('admins')

export function useAdminListPage() {
  const queryClient = useQueryClient()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchUsername = ref('')
  const searchMobile = ref('')

  const queryKey = computed(() => [
    ...adminListQueryKey,
    currentPage.value,
    pageSize.value,
    searchUsername.value,
    searchMobile.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminPage({
        page: currentPage.value,
        size: pageSize.value,
        username: searchUsername.value || undefined,
        mobile: searchMobile.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive<AdminCreateRequest & AdminUpdateRequest>({
    mobile: '',
    username: '',
    avatarUrl: '',
  })

  const dialogTitle = computed(() => (editingId.value ? '编辑管理员' : '新建管理员'))

  const handleSearch = () => {
    currentPage.value = 1
  }

  const resetForm = () => {
    form.mobile = ''
    form.username = ''
    form.avatarUrl = ''
  }

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }

  const openEdit = (row: AdminVO) => {
    form.mobile = row.mobile
    form.username = row.username
    form.avatarUrl = row.avatarUrl
    editingId.value = row.id
    showDialog.value = true
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminListQueryKey })

  const createMutation = useMutation({
    mutationFn: (payload: AdminCreateRequest) => createAdmin(payload),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateRequest }) => updateAdmin(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => updateAdminStatus(id, status),
    onSuccess: invalidate,
  })

  const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

  const handleSubmit = async () => {
    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: {
          username: form.username || undefined,
          mobile: form.mobile || undefined,
          avatarUrl: form.avatarUrl || undefined,
        },
      })
      return
    }

    if (!form.mobile) {
      return
    }

    await createMutation.mutateAsync({
      mobile: form.mobile,
      username: form.username || undefined,
    })
  }

  const toggleStatus = (row: AdminVO) => {
    const status = row.status === USER_STATUS.NORMAL ? USER_STATUS.BANNED : USER_STATUS.NORMAL
    statusMutation.mutate({ id: row.id, status })
  }

  const handleDelete = (_row: AdminVO) => {}

  return {
    currentPage,
    pageSize,
    searchUsername,
    searchMobile,
    isLoading,
    list,
    totalRow,
    totalPages,
    showDialog,
    editingId,
    form,
    dialogTitle,
    isSaving,
    createMutation,
    updateMutation,
    statusMutation,
    handleSearch,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    toggleStatus,
  }
}
