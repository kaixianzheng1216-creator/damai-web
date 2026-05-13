import type { ColumnDef } from '@tanstack/vue-table'
import type { TicketOrderVO } from '@/api/trade'
import { formatDateTime, formatPrice } from '@/utils/format'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createOrderColumns(): ColumnDef<TicketOrderVO>[] {
  return [
    { accessorKey: 'orderNo', header: '订单号', ...fixedColumn(ADMIN_COLUMN_WIDTH.code) },
    {
      accessorKey: 'eventNameSnapshot',
      header: '活动',
      ...contentColumn(ADMIN_COLUMN_WIDTH.title),
    },
    {
      accessorKey: 'venueNameSnapshot',
      header: '场馆',
      ...contentColumn(ADMIN_COLUMN_WIDTH.name),
    },
    {
      accessorKey: 'sessionNameSnapshot',
      header: '场次',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.name),
    },
    {
      accessorKey: 'totalAmount',
      header: '金额',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.amount),
      cell: ({ row }) => formatPrice(Number(row.getValue('totalAmount') ?? 0)),
    },
    {
      accessorKey: 'createAt',
      header: '创建时间',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.dateTime),
      cell: ({ row }) => (row.original.createAt ? formatDateTime(row.original.createAt) : '--'),
    },
  ]
}
