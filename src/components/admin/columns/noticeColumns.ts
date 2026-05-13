import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { NoticeVO } from '@/api/event'
import { NOTICE_TYPE_LABEL } from '@/constants'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createNoticeColumns(options: CrudColumnActions<NoticeVO>): ColumnDef<NoticeVO>[] {
  return [
    {
      accessorKey: 'type',
      header: '类型',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.type),
      cell: ({ row }) => {
        const type = row.original.type
        return h(
          Badge,
          { class: 'border border-border bg-transparent text-foreground' },
          () => NOTICE_TYPE_LABEL[type] ?? type,
        )
      },
    },
    { accessorKey: 'name', header: '名称', ...contentColumn(ADMIN_COLUMN_WIDTH.name) },
    { accessorKey: 'sortOrder', header: '排序', ...fixedColumn(ADMIN_COLUMN_WIDTH.sort) },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
