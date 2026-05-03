import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { TicketVO } from '@/api/ticket/types'
import { PASSENGER_CERT_TYPES } from '@/constants'
import { formatDateTime } from '@/utils/format'

export function createTicketColumns(): ColumnDef<TicketVO>[] {
  return [
    { accessorKey: 'ticketNo', header: '票号', size: 180 },
    { accessorKey: 'eventNameSnapshot', header: '活动', size: 140 },
    { accessorKey: 'venueNameSnapshot', header: '场馆', size: 140 },
    { accessorKey: 'sessionNameSnapshot', header: '场次', size: 140 },
    { accessorKey: 'ticketTypeNameSnapshot', header: '票档', size: 100 },
    { accessorKey: 'passengerNameSnapshot', header: '购票人', size: 140 },
    {
      accessorKey: 'passengerIdTypeSnapshot',
      header: '证件信息',
      size: 180,
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
      size: 100,
      cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
    },
    {
      accessorKey: 'usedAt',
      header: '使用时间',
      size: 160,
      cell: ({ row }) => (row.original.usedAt ? formatDateTime(row.original.usedAt) : '--'),
    },
  ]
}
