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
  type WorkOrderFilterKey,
} from '@/constants'
import { usePagination } from '@/composables/common'
import type { WorkOrderVO } from '@/api/trade'

export const useWorkOrderList = () => {
  const queryClient = useQueryClient()

  const workOrderFilter = ref<WorkOrderFilterKey>('all')
  const workOrderKeyword = ref('')
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
    resetTriggers: [workOrderFilter, workOrderKeyword],
  })

  const requestStatus = computed(() => {
    return WORK_ORDER_STATUS_BY_FILTER[workOrderFilter.value as Exclude<WorkOrderFilterKey, 'all'>]
  })

  const workOrderListQuery = useQuery({
    queryKey: ['my-work-order-page', workOrderPage, workOrderPageSize, requestStatus],
    queryFn: () =>
      fetchMyWorkOrderPage({
        ...getPaginationParams(),
        status: requestStatus.value,
        sortField: 'lastReplyAt',
        sortOrder: 'desc',
      }),
  })

  const workOrderDetailQuery = useQuery({
    queryKey: ['my-work-order-detail', selectedWorkOrderId],
    queryFn: () => fetchWorkOrderById(selectedWorkOrderId.value ?? ''),
    enabled: computed(() => !!selectedWorkOrderId.value),
  })

  const workOrderList = computed(() => getRecords<WorkOrderVO>(workOrderListQuery.data).value ?? [])

  const filteredWorkOrders = computed(() => {
    const keyword = workOrderKeyword.value.trim()
    if (!keyword) {
      return workOrderList.value
    }

    return workOrderList.value.filter((item) =>
      [item.title, item.workOrderNo, item.typeLabel, item.statusLabel, item.lastReplyPreview]
        .filter(Boolean)
        .some((value) => String(value).includes(keyword)),
    )
  })

  const workOrderTotalPages = getTotalPages(workOrderListQuery.data)
  const workOrderTotalRow = getTotalRow(workOrderListQuery.data)
  const selectedWorkOrder = computed(() => workOrderDetailQuery.data.value)
  const selectedWorkOrderClosed = computed(
    () => selectedWorkOrder.value?.status === WORK_ORDER_STATUS.CLOSED,
  )

  const invalidateWorkOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['my-work-order-page'] }),
      queryClient.invalidateQueries({ queryKey: ['my-work-order-detail'] }),
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

    if (!selectedWorkOrderId.value || selectedWorkOrderClosed.value) {
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
    workOrderKeyword,
    workOrderPage,
    workOrderPageSize,
    workOrderListQuery,
    workOrders: filteredWorkOrders,
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
