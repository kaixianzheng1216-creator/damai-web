import type { ColumnDef } from '@tanstack/vue-table'
import type { SeriesEventVO } from '@/api/event'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, fixedColumn } from './columnWidths'

const SERIES_NAME_COLUMN_WIDTH = 520

export function createSeriesColumns(
  options: CrudColumnActions<SeriesEventVO>,
): ColumnDef<SeriesEventVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '系列名称',
      ...fixedColumn(SERIES_NAME_COLUMN_WIDTH),
      meta: {
        multiline: true,
      },
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
