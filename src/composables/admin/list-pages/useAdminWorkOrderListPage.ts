import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { cancelAdminWorkOrder, fetchAdminWorkOrderById, fetchAdminWorkOrderPage } from '@/api/trade'
import type { WorkOrderVO } from '@/api/trade'
import { queryKeys, WORK_ORDER_STATUS } from '@/constants'
import { useAppConfirmDialog } from '@/composables/common/useAppConfirmDialog'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'
import { useWorkOrderChat } from '@/composables/common/useWorkOrderChat'
import { useAdminStore } from '@/stores/admin'

export const ADMIN_WORK_ORDER_STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: String(WORK_ORDER_STATUS.PENDING) },
  { label: '处理中', value: String(WORK_ORDER_STATUS.PROCESSING) },
  { label: '已关闭', value: String(WORK_ORDER_STATUS.CLOSED) },
]

export function useAdminWorkOrderListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchStatus: Ref<string>
  selectedWorkOrderId: Ref<string | null>
  replyContent: Ref<string>
  replyError: Ref<string>
  statusOptions: typeof ADMIN_WORK_ORDER_STATUS_OPTIONS
  isLoading: Ref<boolean>
  list: ComputedRef<WorkOrderVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  selectedWorkOrder: ComputedRef<WorkOrderVO | undefined>
  workOrderDetailQuery: ReturnType<typeof useQuery>
  isChatConnected: Ref<boolean>
  closeMutation: { mutateAsync: (id: string) => Promise<unknown>; isPending: Ref<boolean> }
  confirmDialog: Ref<ConfirmDialogState>
  openDetail: (row: WorkOrderVO) => void
  closeDetail: () => void
  submitReply: () => Promise<void>
  requestClose: (row?: WorkOrderVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useAppConfirmDialog()
  const chat = useWorkOrderChat()
  const adminStore = useAdminStore()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchStatus = ref('all')
  const selectedWorkOrderId = ref<string | null>(null)
  const replyContent = ref('')
  const replyError = ref('')

  watch(
    () => adminStore.adminToken,
    (token) => {
      if (token) chat.connect(token)
    },
    { immediate: true },
  )

  // Auto-sync history after WS reconnect
  chat.onReconnect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.workOrderDetail() })
    // Re-subscribe to current work order if one is open
    if (selectedWorkOrderId.value) {
      chat.subscribe(
        selectedWorkOrderId.value,
        (reply) => {
          queryClient.setQueryData(
            queryKeys.admin.workOrderDetail(selectedWorkOrderId.value),
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

  const queryKey = computed(() => [
    ...queryKeys.admin.workOrderList(),
    currentPage.value,
    pageSize.value,
    searchStatus.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminWorkOrderPage({
        page: currentPage.value,
        size: pageSize.value,
        status: searchStatus.value !== 'all' ? Number(searchStatus.value) : undefined,
        sortField: 'createAt',
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

  watch(searchStatus, () => {
    currentPage.value = 1
  })

  const invalidateWorkOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.workOrderList() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.workOrderDetail() }),
    ])
  }

  const closeMutation = useMutation({
    mutationFn: cancelAdminWorkOrder,
    onSuccess: invalidateWorkOrders,
  })

  const openDetail = (row: WorkOrderVO) => {
    selectedWorkOrderId.value = row.id
    replyContent.value = ''
    replyError.value = ''

    chat.subscribe(
      row.id,
      (reply) => {
        queryClient.setQueryData(
          queryKeys.admin.workOrderDetail(selectedWorkOrderId.value),
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

  const closeDetail = () => {
    if (selectedWorkOrderId.value) {
      chat.unsubscribe(selectedWorkOrderId.value)
    }
    selectedWorkOrderId.value = null
    replyContent.value = ''
    replyError.value = ''
  }

  const replySchema = z.string().min(1, '请输入回复内容')

  const submitReply = async () => {
    const content = replyContent.value.trim()

    const result = replySchema.safeParse(content)
    if (!result.success) {
      replyError.value = result.error.issues[0]?.message ?? '请输入回复内容'
      return
    }

    if (!selectedWorkOrderId.value) {
      return
    }

    if (selectedWorkOrder.value?.status === WORK_ORDER_STATUS.CLOSED) {
      replyError.value = '工单已关闭，无法继续回复'
      return
    }

    chat.sendMessage(selectedWorkOrderId.value, content)
    replyContent.value = ''
    replyError.value = ''
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
    isChatConnected: chat.isConnected,
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
