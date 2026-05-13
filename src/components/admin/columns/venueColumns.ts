import type { ColumnDef } from '@tanstack/vue-table'
import type { VenueVO } from '@/api/event'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createVenueColumns(options: CrudColumnActions<VenueVO>): ColumnDef<VenueVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '场馆名',
      ...contentColumn(ADMIN_COLUMN_WIDTH.name),
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'province',
      header: '省份',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.region),
      cell: ({ row }) => String(row.getValue('province') ?? ''),
    },
    {
      accessorKey: 'city',
      header: '城市',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.region),
      cell: ({ row }) => String(row.getValue('city') ?? ''),
    },
    {
      accessorKey: 'district',
      header: '区县',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.region),
      cell: ({ row }) => String(row.getValue('district') ?? ''),
    },
    {
      accessorKey: 'address',
      header: '地址',
      ...contentColumn(ADMIN_COLUMN_WIDTH.description),
      cell: ({ row }) => String(row.getValue('address') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
