import type { ColumnDef } from '@tanstack/vue-table'
import type { SeriesEventVO } from '@/api/event'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'

export function createSeriesColumns(
  options: CrudColumnActions<SeriesEventVO>,
): ColumnDef<SeriesEventVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '系列名称',
      size: 140,
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
