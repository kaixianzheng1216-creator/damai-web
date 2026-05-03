import type { ColumnDef } from '@tanstack/vue-table'
import type { VenueVO } from '@/api/event'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'

export function createVenueColumns(options: CrudColumnActions<VenueVO>): ColumnDef<VenueVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '场馆名',
      size: 140,
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'province',
      header: '省份',
      size: 100,
      cell: ({ row }) => String(row.getValue('province') ?? ''),
    },
    {
      accessorKey: 'city',
      header: '城市',
      size: 100,
      cell: ({ row }) => String(row.getValue('city') ?? ''),
    },
    {
      accessorKey: 'district',
      header: '区县',
      size: 100,
      cell: ({ row }) => String(row.getValue('district') ?? ''),
    },
    {
      accessorKey: 'address',
      header: '地址',
      size: 180,
      cell: ({ row }) => String(row.getValue('address') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
