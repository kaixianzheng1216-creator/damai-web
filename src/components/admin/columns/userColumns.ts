import type { ColumnDef } from '@tanstack/vue-table'
import type { UserVO } from '@/api/account'
import { USER_STATUS } from '@/constants'
import {
  actionButton,
  stopAndRun,
  accountStatusBadge,
  accountAvatarCell,
  type RowAction,
} from './columnUtils'

export function createUserColumns(options: {
  toggleStatus: RowAction<UserVO>
}): ColumnDef<UserVO>[] {
  return [
    {
      accessorKey: 'avatarUrl',
      header: '头像',
      size: 80,
      cell: ({ row }) => accountAvatarCell(row.original.avatarUrl, `${row.original.username}头像`),
    },
    { accessorKey: 'username', header: '用户名', size: 140 },
    { accessorKey: 'mobile', header: '手机号', size: 140 },
    {
      accessorKey: 'status',
      header: '状态',
      size: 100,
      cell: ({ row }) => accountStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: '操作',
      size: 100,
      cell: ({ row }) =>
        actionButton(
          row.original.status === USER_STATUS.NORMAL ? '封禁' : '解封',
          row.original.status === USER_STATUS.NORMAL ? 'destructive' : 'default',
          (event) => stopAndRun(event, () => options.toggleStatus(row.original)),
        ),
    },
  ]
}
