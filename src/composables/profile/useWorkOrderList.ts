import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  closeWorkOrder,
  fetchMyWorkOrderPage,
  fetchWorkOrderById,
  replyWorkOrder,
} from '@/api/trade'
import {
  WORK_ORDER_PAGE_SIZE,
  WORK_ORDER_STATUS,
  WORK_ORDER_STATUS_BY_FILTER,
  queryKeys,
  type WorkOrderFilterKey,
} from '@/constants'
import { usePagination, useQueryEnabled, type QueryEnabledOptions } from '@/composables/common'
import type { WorkOrderVO } from '@/api/trade'

export const useWorkOrderList = (options: QueryEnabledOptions = {}) => {
  const enabled = useQueryEnabled(options.enabled)
  const queryClient = useQueryClient()

  const workOrderFilter = ref<WorkOrderFilterKey>('all')
  const selectedWorkOrderId = ref<string | null>(null)
  const replyContent = ref('')
  const replyError = ref('')
  const showCloseWorkOrderModal = ref(false)

  const {
    page: workOrderPage,
    pageSize: workOrderPageSize,
    updatePage: updateWorkOrderPage,
    updatePageSize: updateWorkOrderPageSize,
    getPaginationParams,
    getRecords,
    getTotalPages,
    getTotalRow,
  } = usePagination({
    initialPageSize: WORK_ORDER_PAGE_SIZE,
    resetTriggers: [workOrderFilter],
  })

  const requestStatus = computed(() => {
    return WORK_ORDER_STATUS_BY_FILTER[workOrderFilter.value as Exclude<WorkOrderFilterKey, 'all'>]
  })

  const workOrderListQuery = useQuery({
    queryKey: queryKeys.profile.workOrders(workOrderPage, workOrderPageSize, requestStatus),
    queryFn: () =>
      fetchMyWorkOrderPage({
        ...getPaginationParams(),
        status: requestStatus.value,
        sortField: 'lastReplyAt',
        sortOrder: 'desc',
      }),
    enabled,
  })

  const workOrderDetailQuery = useQuery({
    queryKey: queryKeys.profile.workOrderDetail(selectedWorkOrderId),
    queryFn: () => fetchWorkOrderById(selectedWorkOrderId.value ?? ''),
    enabled: computed(() => enabled.value && !!selectedWorkOrderId.value),
  })

  const workOrderList = computed(() => getRecords<WorkOrderVO>(workOrderListQuery.data).value ?? [])

  const workOrderTotalPages = getTotalPages(workOrderListQuery.data)
  const workOrderTotalRow = getTotalRow(workOrderListQuery.data)
  const selectedWorkOrder = computed(() => workOrderDetailQuery.data.value)
  const selectedWorkOrderClosed = computed(
    () => selectedWorkOrder.value?.status === WORK_ORDER_STATUS.CLOSED,
  )

  const invalidateWorkOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.workOrders() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.workOrderDetail() }),
    ])
  }

  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      replyWorkOrder(id, { content }),
    onSuccess: async () => {
      replyContent.value = ''
      replyError.value = ''
      await invalidateWorkOrders()
    },
    onError: () => {
      replyError.value = '回复失败，请稍后重试'
    },
  })

  const closeWorkOrderMutation = useMutation({
    mutationFn: closeWorkOrder,
    onSuccess: async () => {
      showCloseWorkOrderModal.value = false
      await invalidateWorkOrders()
    },
  })

  const openWorkOrderDetail = (workOrder: WorkOrderVO) => {
    selectedWorkOrderId.value = String(workOrder.id)
    replyContent.value = ''
    replyError.value = ''
  }

  const closeWorkOrderDetail = () => {
    selectedWorkOrderId.value = null
    replyContent.value = ''
    replyError.value = ''
    showCloseWorkOrderModal.value = false
  }

  const submitWorkOrderReply = async () => {
    const content = replyContent.value.trim()
    if (!content) {
      replyError.value = '请输入回复内容'
      return
    }

    if (!selectedWorkOrderId.value) {
      return
    }

    if (selectedWorkOrderClosed.value) {
      replyError.value = '工单已关闭，无法继续回复'
      return
    }

    await replyMutation.mutateAsync({
      id: selectedWorkOrderId.value,
      content,
    })
  }

  const openCloseWorkOrderModal = () => {
    if (!selectedWorkOrderId.value || selectedWorkOrderClosed.value) {
      return
    }
    showCloseWorkOrderModal.value = true
  }

  const closeCloseWorkOrderModal = () => {
    showCloseWorkOrderModal.value = false
  }

  const confirmCloseWorkOrder = async () => {
    if (!selectedWorkOrderId.value) {
      return
    }

    await closeWorkOrderMutation.mutateAsync(selectedWorkOrderId.value)
  }

  return {
    workOrderFilter,
    workOrderPage,
    workOrderPageSize,
    workOrderListQuery,
    workOrders: workOrderList,
    workOrderTotalPages,
    workOrderTotalRow,
    selectedWorkOrderId,
    selectedWorkOrder,
    workOrderDetailQuery,
    replyContent,
    replyError,
    replyMutation,
    closeWorkOrderMutation,
    showCloseWorkOrderModal,
    updateWorkOrderPage,
    updateWorkOrderPageSize,
    openWorkOrderDetail,
    closeWorkOrderDetail,
    submitWorkOrderReply,
    openCloseWorkOrderModal,
    closeCloseWorkOrderModal,
    confirmCloseWorkOrder,
  }
}
