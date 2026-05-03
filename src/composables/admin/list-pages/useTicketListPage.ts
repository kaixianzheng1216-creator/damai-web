import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchAdminTicketPage } from '@/api/ticket/ticket'
import { TICKET_STATUS, queryKeys } from '@/constants'
import type { TicketVO } from '@/api/ticket'

export const TICKET_STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '未使用', value: String(TICKET_STATUS.UNUSED) },
  { label: '已使用', value: String(TICKET_STATUS.USED) },
  { label: '已作废', value: String(TICKET_STATUS.VOIDED) },
  { label: '已退票', value: String(TICKET_STATUS.REFUNDED) },
]

export function useTicketListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchStatus: Ref<string>
  showScanDialog: Ref<boolean>
  isLoading: Ref<boolean>
  list: ComputedRef<TicketVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  statusOptions: typeof TICKET_STATUS_OPTIONS
  handleSearch: () => void
  openScanDialog: () => void
} {
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchStatus = ref<string>('all')
  const showScanDialog = ref(false)

  const queryKey = computed(() => [
    ...queryKeys.admin.list('tickets'),
    currentPage.value,
    pageSize.value,
    searchStatus.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminTicketPage({
        page: currentPage.value,
        size: pageSize.value,
        status: searchStatus.value !== 'all' ? Number(searchStatus.value) : undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  const handleSearch = () => {
    currentPage.value = 1
  }

  const openScanDialog = () => {
    showScanDialog.value = true
  }

  return {
    currentPage,
    pageSize,
    searchStatus,
    showScanDialog,
    isLoading,
    list,
    totalRow,
    totalPages,
    statusOptions: TICKET_STATUS_OPTIONS,
    handleSearch,
    openScanDialog,
  }
}
