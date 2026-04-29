import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchAdminOrderPage } from '@/api/trade'
import { ORDER_STATUS, queryKeys } from '@/constants'
import type { TicketOrderPageRequest, TicketOrderVO } from '@/api/trade'

const ORDER_STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '待付款', value: String(ORDER_STATUS.PENDING) },
  { label: '已支付', value: String(ORDER_STATUS.PAID) },
  { label: '已取消', value: String(ORDER_STATUS.CANCELLED) },
  { label: '已关闭', value: String(ORDER_STATUS.CLOSED) },
  { label: '已退款', value: String(ORDER_STATUS.REFUNDED) },
]

export function useOrderListPage() {
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchUserId = ref('')
  const searchStatus = ref('')
  const showDetailDialog = ref(false)
  const selectedOrder = ref<TicketOrderVO | null>(null)

  const queryKey = computed(() => [
    ...queryKeys.admin.list('orders'),
    currentPage.value,
    pageSize.value,
    searchUserId.value,
    searchStatus.value,
  ])

  const pageParams = computed<TicketOrderPageRequest>(() => ({
    page: currentPage.value,
    size: pageSize.value,
    userId: searchUserId.value || undefined,
    status: searchStatus.value !== '' ? Number(searchStatus.value) : undefined,
  }))

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchAdminOrderPage(pageParams.value),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  watch([searchUserId, searchStatus], () => {
    currentPage.value = 1
  })

  const handleSearch = () => {
    currentPage.value = 1
  }

  const openDetail = (row: TicketOrderVO) => {
    selectedOrder.value = row
    showDetailDialog.value = true
  }

  const closeDetail = () => {
    showDetailDialog.value = false
  }

  return {
    currentPage,
    pageSize,
    searchUserId,
    searchStatus,
    showDetailDialog,
    selectedOrder,
    statusOptions: ORDER_STATUS_OPTIONS,
    isLoading,
    list,
    totalRow,
    totalPages,
    handleSearch,
    openDetail,
    closeDetail,
  }
}
