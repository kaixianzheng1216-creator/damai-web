import type { ColumnDef } from '@tanstack/vue-table'
import type { TicketOrderVO } from '@/api/trade'
import { formatDateTime, formatPrice } from '@/utils/format'

export function createOrderColumns(): ColumnDef<TicketOrderVO>[] {
  return [
    { accessorKey: 'orderNo', header: '订单号', size: 180 },
    { accessorKey: 'eventNameSnapshot', header: '活动名称', size: 140 },
    { accessorKey: 'venueNameSnapshot', header: '场馆', size: 140 },
    { accessorKey: 'sessionNameSnapshot', header: '场次', size: 160 },
    {
      accessorKey: 'totalAmount',
      header: '金额',
      size: 120,
      cell: ({ row }) => formatPrice(Number(row.getValue('totalAmount') ?? 0)),
    },
    {
      accessorKey: 'createAt',
      header: '创建时间',
      size: 160,
      cell: ({ row }) => (row.original.createAt ? formatDateTime(row.original.createAt) : '--'),
    },
  ]
}
