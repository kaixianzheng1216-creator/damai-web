import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { WorkOrderVO } from '@/api/trade'
import { WORK_ORDER_STATUS } from '@/constants'
import { formatDateTime } from '@/utils/format'
import { getWorkOrderStatusBadgeClass } from '@/utils/statusMappers'
import { actionGroup, actionButton, stopAndRun, type RowAction } from './columnUtils'

export function createWorkOrderColumns(options: {
  openDetail: RowAction<WorkOrderVO>
  requestClose: RowAction<WorkOrderVO>
}): ColumnDef<WorkOrderVO>[] {
  return [
    { accessorKey: 'workOrderNo', header: '工单号', size: 180 },
    { accessorKey: 'title', header: '标题', size: 140 },
    { accessorKey: 'userId', header: '用户 ID', size: 120 },
    { accessorKey: 'typeLabel', header: '类型', size: 100 },
    {
      accessorKey: 'status',
      header: '状态',
      size: 100,
      cell: ({ row }) =>
        h(
          Badge,
          { class: getWorkOrderStatusBadgeClass(row.original.status) },
          () => row.original.statusLabel,
        ),
    },
    {
      accessorKey: 'createAt',
      header: '创建时间',
      size: 160,
      cell: ({ row }) => formatDateTime(row.original.createAt, '-'),
    },

    {
      accessorKey: 'related',
      header: '关联',
      size: 180,
      cell: ({ row }) => {
        const orderId = row.original.relatedOrderId
        const ticketId = row.original.relatedTicketId
        const parts: string[] = []
        if (orderId && orderId !== '0') parts.push(`订单:${orderId}`)
        if (ticketId && ticketId !== '0') parts.push(`票券:${ticketId}`)
        return parts.length > 0 ? parts.join(' ') : '-'
      },
    },
    {
      accessorKey: 'closedBy',
      header: '关闭者',
      size: 140,
      cell: ({ row }) => {
        if (row.original.status !== WORK_ORDER_STATUS.CLOSED) return '-'
        const type = row.original.closedByType
        const by = row.original.closedBy
        if (type == null || by == null) return '-'
        return `${type === 1 ? '用户' : '客服'}:${by}`
      },
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) =>
        actionGroup([
          actionButton('详情', 'outline', (event) =>
            stopAndRun(event, () => options.openDetail(row.original)),
          ),
          row.original.status !== WORK_ORDER_STATUS.CLOSED
            ? actionButton('关闭', 'destructive', (event) =>
                stopAndRun(event, () => options.requestClose(row.original)),
              )
            : null,
        ]),
    },
  ]
}
