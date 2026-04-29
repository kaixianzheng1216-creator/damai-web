import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  closeAdminWorkOrder,
  fetchAdminWorkOrderById,
  fetchAdminWorkOrderPage,
  replyAdminWorkOrder,
} from '@/api/trade'
import type { WorkOrderVO } from '@/api/trade'
import { queryKeys, WORK_ORDER_STATUS } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

export const ADMIN_WORK_ORDER_STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: String(WORK_ORDER_STATUS.PENDING) },
  { label: '处理中', value: String(WORK_ORDER_STATUS.PROCESSING) },
  { label: '已关闭', value: String(WORK_ORDER_STATUS.CLOSED) },
]

export function useAdminWorkOrderListPage() {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchUserId = ref('')
  const searchStatus = ref('all')
  const selectedWorkOrderId = ref<string | null>(null)
  const replyContent = ref('')
  const replyError = ref('')

  const queryKey = computed(() => [
    ...queryKeys.admin.workOrderList(),
    currentPage.value,
    pageSize.value,
    searchUserId.value,
    searchStatus.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminWorkOrderPage({
        page: currentPage.value,
        size: pageSize.value,
        userId: searchUserId.value || undefined,
        status: searchStatus.value !== 'all' ? Number(searchStatus.value) : undefined,
        sortField: 'lastReplyAt',
        sortOrder: 'desc',
      }),
  })

  const workOrderDetailQuery = useQuery({
    queryKey: queryKeys.admin.workOrderDetail(selectedWorkOrderId),
    queryFn: () => fetchAdminWorkOrderById(selectedWorkOrderId.value ?? ''),
    enabled: computed(() => !!selectedWorkOrderId.value),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))
  const selectedWorkOrder = computed(() => workOrderDetailQuery.data.value)

  watch([searchUserId, searchStatus], () => {
    currentPage.value = 1
  })

  const invalidateWorkOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.workOrderList() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.workOrderDetail() }),
    ])
  }

  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      replyAdminWorkOrder(id, { content }),
    onSuccess: async () => {
      replyContent.value = ''
      replyError.value = ''
      await invalidateWorkOrders()
    },
  })

  const closeMutation = useMutation({
    mutationFn: closeAdminWorkOrder,
    onSuccess: invalidateWorkOrders,
  })

  const openDetail = (row: WorkOrderVO) => {
    selectedWorkOrderId.value = row.id
    replyContent.value = ''
    replyError.value = ''
  }

  const closeDetail = () => {
    selectedWorkOrderId.value = null
    replyContent.value = ''
    replyError.value = ''
  }

  const submitReply = async () => {
    const content = replyContent.value.trim()
    if (!content) {
      replyError.value = '请输入回复内容'
      return
    }

    if (
      !selectedWorkOrderId.value ||
      selectedWorkOrder.value?.status === WORK_ORDER_STATUS.CLOSED
    ) {
      return
    }

    await replyMutation.mutateAsync({
      id: selectedWorkOrderId.value,
      content,
    })
  }

  const requestClose = (row?: WorkOrderVO) => {
    const id = row?.id ?? selectedWorkOrderId.value
    const title = row?.title || selectedWorkOrder.value?.title || '该工单'

    if (!id) {
      return
    }

    openConfirm('关闭工单', `确认关闭「${title}」吗？关闭后用户与客服都无法继续回复。`, () =>
      closeMutation.mutateAsync(id),
    )
  }

  return {
    currentPage,
    pageSize,
    searchUserId,
    searchStatus,
    selectedWorkOrderId,
    replyContent,
    replyError,
    statusOptions: ADMIN_WORK_ORDER_STATUS_OPTIONS,
    isLoading,
    list,
    totalRow,
    totalPages,
    selectedWorkOrder,
    workOrderDetailQuery,
    replyMutation,
    closeMutation,
    confirmDialog,
    openDetail,
    closeDetail,
    submitReply,
    requestClose,
    closeConfirm,
    handleConfirm,
  }
}
