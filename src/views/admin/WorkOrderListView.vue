<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import WorkOrderDetailDialog from '@/components/admin/WorkOrderDetailDialog.vue'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import {
  closeAdminWorkOrder,
  fetchAdminWorkOrderById,
  fetchAdminWorkOrderPage,
  replyAdminWorkOrder,
} from '@/api/trade'
import type { WorkOrderVO } from '@/api/trade'
import { WORK_ORDER_STATUS, queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { formatDateTime } from '@/utils/format'
import { getWorkOrderStatusBadgeClass } from '@/utils/statusMappers'

const queryClient = useQueryClient()
const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

const currentPage = ref(1)
const pageSize = ref(10)
const searchUserId = ref('')
const searchStatus = ref('all')
const selectedWorkOrderId = ref<string | null>(null)
const replyContent = ref('')
const replyError = ref('')

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: String(WORK_ORDER_STATUS.PENDING) },
  { label: '处理中', value: String(WORK_ORDER_STATUS.PROCESSING) },
  { label: '已关闭', value: String(WORK_ORDER_STATUS.CLOSED) },
]

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
  selectedWorkOrderId.value = String(row.id)
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

  if (!selectedWorkOrderId.value || selectedWorkOrder.value?.status === WORK_ORDER_STATUS.CLOSED) {
    return
  }

  await replyMutation.mutateAsync({
    id: selectedWorkOrderId.value,
    content,
  })
}

const requestClose = (row?: WorkOrderVO) => {
  const id = row ? String(row.id) : selectedWorkOrderId.value
  const title = row?.title || selectedWorkOrder.value?.title || '该工单'

  if (!id) {
    return
  }

  openConfirm('关闭工单', `确认关闭「${title}」吗？关闭后用户与客服都无法继续回复。`, () =>
    closeMutation.mutateAsync(id),
  )
}

const columns: ColumnDef<WorkOrderVO>[] = [
  { accessorKey: 'id', header: 'ID', size: 120 },
  { accessorKey: 'workOrderNo', header: '工单号', size: 180 },
  { accessorKey: 'title', header: '标题' },
  { accessorKey: 'userId', header: '用户 ID', size: 120 },
  { accessorKey: 'typeLabel', header: '类型', size: 120 },
  {
    accessorKey: 'status',
    header: '状态',
    size: 120,
    cell: ({ row }) =>
      h(
        Badge,
        { class: getWorkOrderStatusBadgeClass(row.original.status) },
        () => row.original.statusLabel,
      ),
  },
  {
    accessorKey: 'lastReplyAt',
    header: '最后回复',
    size: 160,
    cell: ({ row }) => formatDateTime(row.original.lastReplyAt, '-'),
  },
  {
    id: 'actions',
    header: '操作',
    size: 180,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            onClick: (event: Event) => {
              event.stopPropagation()
              openDetail(row.original)
            },
          },
          () => '详情',
        ),
        row.original.status !== WORK_ORDER_STATUS.CLOSED
          ? h(
              Button,
              {
                variant: 'destructive',
                size: 'sm',
                onClick: (event: Event) => {
                  event.stopPropagation()
                  requestClose(row.original)
                },
              },
              () => '关闭',
            )
          : null,
      ]),
  },
]
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :current-page="currentPage"
    :total-pages="totalPages"
    :page-size="pageSize"
    :total-row="totalRow"
    title="工单管理"
    :show-create-button="false"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @row-click="openDetail"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchStatus">
          <SelectTrigger class="h-8 w-28">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input v-model="searchUserId" placeholder="用户 ID" class="h-8 w-28" />
      </div>
    </template>
  </DataTableCrud>

  <WorkOrderDetailDialog
    v-model:reply-content="replyContent"
    :open="!!selectedWorkOrderId"
    :work-order="selectedWorkOrder"
    :is-loading="workOrderDetailQuery.isLoading.value"
    :is-replying="replyMutation.isPending.value"
    :is-closing="closeMutation.isPending.value"
    :reply-error="replyError"
    @close="closeDetail"
    @reply="submitReply"
    @close-work-order="requestClose()"
  />

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    :confirm-text="confirmDialog.confirmText"
    :confirm-variant="confirmDialog.confirmVariant"
    :loading="confirmDialog.isProcessing"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
