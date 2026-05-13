import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { WorkOrderVO } from '@/api/trade'
import { WORK_ORDER_STATUS } from '@/constants'
import { formatDateTime } from '@/utils/format'
import { getWorkOrderStatusBadgeClass } from '@/utils/statusMappers'
import { actionGroup, actionButton, stopAndRun, type RowAction } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createWorkOrderColumns(options: {
  openDetail: RowAction<WorkOrderVO>
  requestClose: RowAction<WorkOrderVO>
}): ColumnDef<WorkOrderVO>[] {
  return [
    { accessorKey: 'workOrderNo', header: '工单号', ...fixedColumn(ADMIN_COLUMN_WIDTH.code) },
    { accessorKey: 'title', header: '标题', ...contentColumn(ADMIN_COLUMN_WIDTH.title) },
    { accessorKey: 'userId', header: '用户 ID', ...fixedColumn(ADMIN_COLUMN_WIDTH.entityId) },
    { accessorKey: 'typeLabel', header: '类型', ...fixedColumn(ADMIN_COLUMN_WIDTH.type) },
    {
      accessorKey: 'status',
      header: '状态',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.status),
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
      ...fixedColumn(ADMIN_COLUMN_WIDTH.dateTime),
      cell: ({ row }) => formatDateTime(row.original.createAt, '-'),
    },

    {
      accessorKey: 'related',
      header: '关联',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.code),
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
      ...fixedColumn(ADMIN_COLUMN_WIDTH.entityId),
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
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
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
