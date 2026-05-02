import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { closeMyWorkOrder, fetchMyWorkOrderPage, fetchMyWorkOrderById } from '@/api/trade'
import {
  WORK_ORDER_PAGE_SIZE,
  WORK_ORDER_STATUS,
  WORK_ORDER_STATUS_BY_FILTER,
  queryKeys,
  type WorkOrderFilterKey,
} from '@/constants'
import { usePagination, useQueryEnabled, type QueryEnabledOptions } from '@/composables/common'
import { useWorkOrderChat } from '@/composables/common/useWorkOrderChat'
import { useUserStore } from '@/stores/user'
import type { WorkOrderVO } from '@/api/trade'

export const useWorkOrderList = (options: QueryEnabledOptions = {}) => {
  const enabled = useQueryEnabled(options.enabled)
  const queryClient = useQueryClient()
  const chat = useWorkOrderChat()
  const userStore = useUserStore()

  // Connect WebSocket when token is available
  watch(
    () => userStore.token,
    (token) => {
      if (token) chat.connect(token)
    },
    { immediate: true },
  )

  // Auto-sync history after WS reconnect
  chat.onReconnect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.workOrderDetail() })
    // Re-subscribe to current work order if one is open
    if (selectedWorkOrderId.value) {
      chat.subscribe(
        selectedWorkOrderId.value,
        (reply) => {
          queryClient.setQueryData(
            queryKeys.profile.workOrderDetail(selectedWorkOrderId.value),
            (old: typeof workOrderDetailQuery.data.value) => {
              if (!old) return old
              const existing = [...(old.replies ?? [])]
              if (!existing.some((r) => r.id === reply.id)) {
                existing.push(reply)
                return { ...old, replies: existing }
              }
              return old
            },
          )
        },
        (error) => {
          replyError.value = error
        },
      )
    }
  })

  const workOrderFilter = ref<WorkOrderFilterKey>('all')
  const selectedWorkOrderId = ref<string | null>(null)
  const replyContent = ref('')
  const replyError = ref('')

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
        sortField: 'createAt',
        sortOrder: 'desc',
      }),
    enabled,
  })

  const workOrderDetailQuery = useQuery({
    queryKey: queryKeys.profile.workOrderDetail(selectedWorkOrderId),
    queryFn: () => fetchMyWorkOrderById(selectedWorkOrderId.value ?? ''),
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

  const closeWorkOrderMutation = useMutation({
    mutationFn: closeMyWorkOrder,
    onSuccess: async () => {
      await invalidateWorkOrders()
    },
  })

  const openWorkOrderDetail = (workOrder: WorkOrderVO) => {
    selectedWorkOrderId.value = String(workOrder.id)
    replyContent.value = ''
    replyError.value = ''

    chat.subscribe(
      String(workOrder.id),
      (reply) => {
        // Append incoming WS message to replies array
        queryClient.setQueryData(
          queryKeys.profile.workOrderDetail(selectedWorkOrderId.value),
          (old: typeof workOrderDetailQuery.data.value) => {
            if (!old) return old
            const existing = [...(old.replies ?? [])]
            // Prevent duplicates: check if this message already exists
            if (!existing.some((r) => r.id === reply.id)) {
              existing.push(reply)
              return { ...old, replies: existing }
            }
            return old
          },
        )
      },
      (error) => {
        replyError.value = error
      },
    )
  }

  const closeWorkOrderDetail = () => {
    if (selectedWorkOrderId.value) {
      chat.unsubscribe(selectedWorkOrderId.value)
    }
    selectedWorkOrderId.value = null
    replyContent.value = ''
    replyError.value = ''
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

    chat.sendMessage(selectedWorkOrderId.value, content)
    replyContent.value = ''
    replyError.value = ''
  }

  const confirmCloseWorkOrder = async () => {
    if (!selectedWorkOrderId.value) {
      return
    }

    const id = selectedWorkOrderId.value
    closeWorkOrderDetail()
    await closeWorkOrderMutation.mutateAsync(id)
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
    isChatConnected: chat.isConnected,
    closeWorkOrderMutation,
    updateWorkOrderPage,
    updateWorkOrderPageSize,
    openWorkOrderDetail,
    closeWorkOrderDetail,
    submitWorkOrderReply,
    confirmCloseWorkOrder,
  }
}
