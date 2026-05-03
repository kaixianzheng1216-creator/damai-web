import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchAdminUserPage, updateAdminUserStatus } from '@/api/account/user'
import type { UserVO } from '@/api/account'
import { queryKeys, USER_STATUS } from '@/constants'

const adminUsersQueryKey = queryKeys.admin.list('users')

export function useAdminUserListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchUsername: Ref<string>
  searchMobile: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<UserVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  statusMutation: { mutate: (vars: { id: string; status: number }) => void }
  handleSearch: () => void
  toggleStatus: (row: UserVO) => void
} {
  const queryClient = useQueryClient()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchUsername = ref('')
  const searchMobile = ref('')

  const queryKey = computed(() => [
    ...adminUsersQueryKey,
    currentPage.value,
    pageSize.value,
    searchUsername.value,
    searchMobile.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminUserPage({
        page: currentPage.value,
        size: pageSize.value,
        username: searchUsername.value || undefined,
        mobile: searchMobile.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  const handleSearch = () => {
    currentPage.value = 1
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      updateAdminUserStatus(id, status as 0 | 1),
    onSuccess: invalidate,
  })

  const toggleStatus = (row: UserVO) => {
    const status = row.status === USER_STATUS.NORMAL ? USER_STATUS.BANNED : USER_STATUS.NORMAL
    statusMutation.mutate({ id: row.id, status })
  }

  return {
    currentPage,
    pageSize,
    searchUsername,
    searchMobile,
    isLoading,
    list,
    totalRow,
    totalPages,
    statusMutation,
    handleSearch,
    toggleStatus,
  }
}
