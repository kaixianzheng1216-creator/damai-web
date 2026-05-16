import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationReturnType,
} from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createAdminRefund, fetchAdminOrderById, fetchAdminOrderPage } from '@/api/trade'
import { ORDER_STATUS, queryKeys, TOAST_COPY } from '@/constants'
import type { RefundVO, TicketOrderPageRequest, TicketOrderVO } from '@/api/trade'

const ORDER_STATUS_OPTIONS = [
  { label: '全部状态', value: 'all' },
  { label: '待付款', value: String(ORDER_STATUS.PENDING) },
  { label: '已支付', value: String(ORDER_STATUS.PAID) },
  { label: '已取消', value: String(ORDER_STATUS.CANCELLED) },
  { label: '已关闭', value: String(ORDER_STATUS.CLOSED) },
  { label: '已退款', value: String(ORDER_STATUS.REFUNDED) },
]

export function useOrderListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchStatus: Ref<string>
  showDetailDialog: Ref<boolean>
  selectedOrder: Ref<TicketOrderVO | null>
  isDetailLoading: Ref<boolean>
  showRefundDialog: Ref<boolean>
  statusOptions: typeof ORDER_STATUS_OPTIONS
  isLoading: Ref<boolean>
  canRefundSelectedOrder: ComputedRef<boolean>
  list: ComputedRef<TicketOrderVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  refundMutation: UseMutationReturnType<RefundVO, Error, string, unknown>
  handleSearch: () => void
  openDetail: (row: TicketOrderVO) => Promise<void>
  closeDetail: () => void
  openRefundDialog: () => void
  closeRefundDialog: () => void
} {
  const queryClient = useQueryClient()
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchStatus = ref('all')
  const showDetailDialog = ref(false)
  const selectedOrder = ref<TicketOrderVO | null>(null)
  const isDetailLoading = ref(false)
  const showRefundDialog = ref(false)

  const queryKey = computed(() => [
    ...queryKeys.admin.list('orders'),
    currentPage.value,
    pageSize.value,
    searchStatus.value,
  ])

  const pageParams = computed<TicketOrderPageRequest>(() => ({
    page: currentPage.value,
    size: pageSize.value,
    status: searchStatus.value !== 'all' ? Number(searchStatus.value) : undefined,
  }))

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchAdminOrderPage(pageParams.value),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))
  const canRefundSelectedOrder = computed(() => selectedOrder.value?.status === ORDER_STATUS.PAID)

  watch(searchStatus, () => {
    currentPage.value = 1
  })

  const handleSearch = () => {
    currentPage.value = 1
  }

  const openDetail = async (row: TicketOrderVO) => {
    isDetailLoading.value = true
    try {
      const detail = await fetchAdminOrderById(row.id)
      selectedOrder.value = detail
      showDetailDialog.value = true
    } finally {
      isDetailLoading.value = false
    }
  }

  const closeDetail = () => {
    showDetailDialog.value = false
  }

  const openRefundDialog = () => {
    if (canRefundSelectedOrder.value) {
      showRefundDialog.value = true
    }
  }

  const closeRefundDialog = () => {
    if (!refundMutation.isPending.value) {
      showRefundDialog.value = false
    }
  }

  const refundMutation = useMutation({
    mutationFn: (reason: string) => {
      if (!selectedOrder.value) {
        throw new Error('Missing selected order before refund')
      }

      return createAdminRefund(selectedOrder.value.id, { reason })
    },
    onSuccess: async () => {
      toast.success(TOAST_COPY.adminRefundSucceeded)
      showRefundDialog.value = false
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('orders') })

      if (selectedOrder.value) {
        selectedOrder.value = await fetchAdminOrderById(selectedOrder.value.id)
      }
    },
    onError: () => {
      toast.error(TOAST_COPY.adminRefundFailed)
    },
  })

  return {
    currentPage,
    pageSize,
    searchStatus,
    showDetailDialog,
    selectedOrder,
    isDetailLoading,
    showRefundDialog,
    statusOptions: ORDER_STATUS_OPTIONS,
    isLoading,
    canRefundSelectedOrder,
    list,
    totalRow,
    totalPages,
    refundMutation,
    handleSearch,
    openDetail,
    closeDetail,
    openRefundDialog,
    closeRefundDialog,
  }
}
