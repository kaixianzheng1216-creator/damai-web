import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { TicketVO } from '@/api/ticket/types'
import { PASSENGER_CERT_TYPES } from '@/constants'
import { formatDateTime } from '@/utils/format'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createTicketColumns(): ColumnDef<TicketVO>[] {
  return [
    { accessorKey: 'ticketNo', header: '票号', ...fixedColumn(ADMIN_COLUMN_WIDTH.code) },
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
      accessorKey: 'ticketTypeNameSnapshot',
      header: '票档',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.type),
    },
    {
      accessorKey: 'passengerNameSnapshot',
      header: '购票人',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.name),
    },
    {
      accessorKey: 'passengerIdTypeSnapshot',
      header: '证件信息',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.code),
      cell: ({ row }) => {
        const typeValue = row.original.passengerIdTypeSnapshot
        const typeLabel = typeValue
          ? Object.values(PASSENGER_CERT_TYPES).find((t) => t.value === typeValue)?.label
          : undefined
        const certNo = row.original.passengerIdNoMaskedSnapshot
        if (!typeLabel && !certNo) return '-'
        return `${typeLabel || ''} ${certNo || ''}`.trim()
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.status),
      cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
    },
    {
      accessorKey: 'usedAt',
      header: '使用时间',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.dateTime),
      cell: ({ row }) => (row.original.usedAt ? formatDateTime(row.original.usedAt) : '--'),
    },
  ]
}
