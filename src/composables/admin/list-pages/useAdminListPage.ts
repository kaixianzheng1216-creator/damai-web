import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { createAdmin, fetchAdminPage, updateAdmin, updateAdminStatus } from '@/api/account/admin'
import type { AdminCreateRequest, AdminUpdateRequest, AdminVO } from '@/api/account'
import { queryKeys, USER_STATUS } from '@/constants'

type AdminForm = {
  mobile: string
  username: string
  avatarUrl: string
}

export function useAdminListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchUsername: Ref<string>
  searchMobile: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<AdminVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: AdminForm
  dialogTitle: ComputedRef<string>
  isSaving: ComputedRef<boolean>
  statusMutation: { mutate: (vars: { id: string; status: number }) => void }
  handleSearch: () => void
  openCreate: () => void
  openEdit: (row: AdminVO) => void
  handleSubmit: () => Promise<void>
  toggleStatus: (row: AdminVO) => void
} {
  const crud = useAdminCrud<AdminVO, AdminForm, AdminCreateRequest, AdminUpdateRequest>({
    queryKeyBase: queryKeys.admin.list('admins'),
    fetchPage: (params) =>
      fetchAdminPage({
        page: params.page,
        size: params.size,
      }),
    createItem: (data) => createAdmin(data),
    updateItem: (id, data) => updateAdmin(id, data as AdminUpdateRequest),
    deleteItem: async () => {},
    initialForm: {
      mobile: '',
      username: '',
      avatarUrl: '',
    },
  })

  // Admin-specific search fields (useAdminCrud only supports a single searchName)
  const searchUsername = ref('')
  const searchMobile = ref('')

  // Custom query with admin-specific search fields
  const adminQueryKey = computed(() => [
    ...queryKeys.admin.list('admins'),
    crud.currentPage.value,
    crud.pageSize.value,
    searchUsername.value,
    searchMobile.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKey,
    queryFn: () =>
      fetchAdminPage({
        page: crud.currentPage.value,
        size: crud.pageSize.value,
        username: searchUsername.value || undefined,
        mobile: searchMobile.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  const handleSearch = () => {
    crud.currentPage.value = 1
  }

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑管理员' : '新建管理员'))

  const isSaving = computed(
    () => crud.createMutation.isPending.value || crud.updateMutation.isPending.value,
  )

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      updateAdminStatus(id, status as 0 | 1),
    onSuccess: () => crud.invalidate(),
  })

  const openEdit = (row: AdminVO) => {
    crud.openEdit(row, (item) => ({
      mobile: item.mobile,
      username: item.username,
      avatarUrl: item.avatarUrl,
    }))
  }

  const adminSchema = z.object({
    mobile: z.string().min(1, '请填写手机号'),
    username: z.string().optional(),
    avatarUrl: z.string().optional(),
  })

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        if (crud.editingId.value) return true
        const result = adminSchema.safeParse(crud.form)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message ?? '请填写手机号')
          return false
        }
        return true
      },
      getCreateData: (f) => ({
        mobile: f.mobile,
        username: f.username || undefined,
      }),
      getUpdateData: (f) => ({
        username: f.username || undefined,
        mobile: f.mobile || undefined,
        avatarUrl: f.avatarUrl || undefined,
      }),
    })

  const toggleStatus = (row: AdminVO) => {
    const status = row.status === USER_STATUS.NORMAL ? USER_STATUS.BANNED : USER_STATUS.NORMAL
    statusMutation.mutate({ id: row.id, status })
  }

  return {
    currentPage: crud.currentPage,
    pageSize: crud.pageSize,
    searchUsername,
    searchMobile,
    isLoading,
    list,
    totalRow,
    totalPages,
    showDialog: crud.showDialog,
    editingId: crud.editingId,
    form: crud.form,
    dialogTitle,
    isSaving,
    statusMutation,
    handleSearch,
    openCreate: crud.openCreate,
    openEdit,
    handleSubmit,
    toggleStatus,
  }
}
