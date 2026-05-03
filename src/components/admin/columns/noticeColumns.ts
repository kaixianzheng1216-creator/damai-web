import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { NoticeVO } from '@/api/event'
import { NOTICE_TYPE_LABEL } from '@/constants'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'

export function createNoticeColumns(options: CrudColumnActions<NoticeVO>): ColumnDef<NoticeVO>[] {
  return [
    {
      accessorKey: 'type',
      header: '类型',
      size: 100,
      cell: ({ row }) => {
        const type = row.original.type
        return h(
          Badge,
          { class: 'border border-border bg-transparent text-foreground' },
          () => NOTICE_TYPE_LABEL[type] ?? type,
        )
      },
    },
    { accessorKey: 'name', header: '名称', size: 140 },
    { accessorKey: 'sortOrder', header: '排序', size: 80 },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
