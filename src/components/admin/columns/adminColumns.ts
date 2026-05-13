import type { ColumnDef } from '@tanstack/vue-table'
import type { AdminVO } from '@/api/account'
import { USER_STATUS } from '@/constants'
import {
  actionGroup,
  actionButton,
  stopAndRun,
  accountStatusBadge,
  accountAvatarCell,
  type RowAction,
} from './columnUtils'
import { ADMIN_COLUMN_WIDTH, fixedColumn } from './columnWidths'

export function createAdminColumns(options: {
  openEdit: RowAction<AdminVO>
  toggleStatus: RowAction<AdminVO>
}): ColumnDef<AdminVO>[] {
  return [
    {
      accessorKey: 'avatarUrl',
      header: '头像',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.avatar),
      cell: ({ row }) => accountAvatarCell(row.original.avatarUrl, `${row.original.username}头像`),
    },
    { accessorKey: 'username', header: '用户名', ...fixedColumn(ADMIN_COLUMN_WIDTH.name) },
    { accessorKey: 'mobile', header: '手机号', ...fixedColumn(ADMIN_COLUMN_WIDTH.phone) },
    {
      accessorKey: 'status',
      header: '状态',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.status),
      cell: ({ row }) => accountStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) =>
        actionGroup([
          actionButton('编辑', 'outline', (event) =>
            stopAndRun(event, () => options.openEdit(row.original)),
          ),
          actionButton(
            row.original.status === USER_STATUS.NORMAL ? '封禁' : '解封',
            row.original.status === USER_STATUS.NORMAL ? 'destructive' : 'default',
            (event) => stopAndRun(event, () => options.toggleStatus(row.original)),
          ),
        ]),
    },
  ]
}
