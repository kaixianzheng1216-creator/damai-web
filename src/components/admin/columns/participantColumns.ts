import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { ParticipantVO } from '@/api/event'
import { editDeleteActions, type CrudColumnActions } from './columnUtils'

export function createParticipantColumns(
  options: CrudColumnActions<ParticipantVO>,
): ColumnDef<ParticipantVO>[] {
  return [
    {
      id: 'avatar',
      header: '头像',
      size: 80,
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
      size: 140,
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'followCount',
      header: '关注人数',
      size: 80,
      cell: ({ row }) => row.original.followCount ?? '-',
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
