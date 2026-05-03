import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { EventVO } from '@/api/event'
import { EVENT_STATUS } from '@/constants'
import { actionGroup, actionButton, stopAndRun, type RowAction } from './columnUtils'

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
      size: 140,
    },
    {
      accessorKey: 'cityNameSnapshot',
      header: '城市',
      size: 100,
    },
    {
      accessorKey: 'categoryNameSnapshot',
      header: '分类',
      size: 140,
      cell: ({ row }) => {
        const parent = row.original.parentCategoryNameSnapshot
        const child = row.original.categoryNameSnapshot
        return parent && child ? `${parent} / ${child}` : child || parent || '-'
      },
    },
    {
      accessorKey: 'venueNameSnapshot',
      header: '场馆',
      size: 140,
    },

    {
      accessorKey: 'followCount',
      header: '关注人数',
      size: 80,
      cell: ({ row }) => row.original.followCount ?? '-',
    },
    {
      accessorKey: 'statusLabel',
      header: '状态',
      size: 100,
      cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
    },
    {
      accessorKey: 'recommendWeight',
      header: '推荐权重',
      size: 80,
      cell: ({ row }) => row.original.recommendWeight ?? '-',
    },
    {
      id: 'actions',
      header: '操作',
      size: 220,
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
