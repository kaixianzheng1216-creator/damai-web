import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { EventVO } from '@/api/event'
import { EVENT_STATUS } from '@/constants'
import { actionGroup, actionButton, stopAndRun, type RowAction } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createEventColumns(options: {
  openEdit: RowAction<EventVO>
  handleDelete: RowAction<EventVO>
  handlePublish: RowAction<EventVO>
  handleOffline: RowAction<EventVO>
}): ColumnDef<EventVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '活动名称',
      ...contentColumn(ADMIN_COLUMN_WIDTH.title),
    },
    {
      accessorKey: 'cityNameSnapshot',
      header: '城市',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.city),
    },
    {
      accessorKey: 'categoryNameSnapshot',
      header: '分类',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.name),
      cell: ({ row }) => {
        const parent = row.original.parentCategoryNameSnapshot
        const child = row.original.categoryNameSnapshot
        return parent && child ? `${parent} / ${child}` : child || parent || '-'
      },
    },
    {
      accessorKey: 'venueNameSnapshot',
      header: '场馆',
      ...contentColumn(ADMIN_COLUMN_WIDTH.name),
    },

    {
      accessorKey: 'followCount',
      header: '关注人数',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.count),
      cell: ({ row }) => row.original.followCount ?? '-',
    },
    {
      accessorKey: 'statusLabel',
      header: '状态',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.status),
      cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
    },
    {
      accessorKey: 'recommendWeight',
      header: '推荐权重',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.count),
      cell: ({ row }) => row.original.recommendWeight ?? '-',
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsXl),
      cell: ({ row }) =>
        actionGroup([
          actionButton('编辑', 'outline', (event) =>
            stopAndRun(event, () => options.openEdit(row.original)),
          ),
          row.original.status === EVENT_STATUS.DRAFT
            ? actionButton('发布', 'outline', (event) =>
                stopAndRun(event, () => options.handlePublish(row.original)),
              )
            : null,
          row.original.status === EVENT_STATUS.PUBLISHED
            ? actionButton('下线', 'outline', (event) =>
                stopAndRun(event, () => options.handleOffline(row.original)),
              )
            : null,
          row.original.status === EVENT_STATUS.OFFLINE
            ? actionButton('上线', 'outline', (event) =>
                stopAndRun(event, () => options.handlePublish(row.original)),
              )
            : null,
          actionButton('删除', 'destructive', (event) =>
            stopAndRun(event, () => options.handleDelete(row.original)),
          ),
        ]),
    },
  ]
}
