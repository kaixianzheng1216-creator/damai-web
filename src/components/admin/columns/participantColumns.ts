import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { ParticipantVO } from '@/api/event'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createParticipantColumns(
  options: CrudColumnActions<ParticipantVO>,
): ColumnDef<ParticipantVO>[] {
  return [
    {
      id: 'avatar',
      header: '头像',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.avatar),
      cell: ({ row }) => {
        const avatarUrl = row.original.avatarUrl
        return avatarUrl
          ? h('img', {
              src: avatarUrl,
              alt: row.original.name,
              class: 'h-10 w-10 rounded-full border border-border object-cover',
            })
          : h(
              'div',
              {
                class: 'flex-center h-10 w-10 rounded-full bg-muted text-muted-foreground',
              },
              '暂无',
            )
      },
    },
    {
      accessorKey: 'name',
      header: '名称',
      ...contentColumn(ADMIN_COLUMN_WIDTH.name),
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'followCount',
      header: '关注人数',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.count),
      cell: ({ row }) => row.original.followCount ?? '-',
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
