import type { ColumnDef } from '@tanstack/vue-table'
import type { CategoryVO } from '@/api/event'
import {
  actionGroup,
  actionButton,
  stopAndRun,
  editDeleteActions,
  type RowAction,
  type CrudColumnActions,
} from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createCategoryColumns(options: {
  openManageChildren: RowAction<CategoryVO>
  openEdit: RowAction<CategoryVO>
  handleDelete: RowAction<CategoryVO>
}): ColumnDef<CategoryVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '分类名',
      ...contentColumn(ADMIN_COLUMN_WIDTH.name),
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.sort),
      cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
    },
    {
      accessorKey: 'parentId',
      header: '父分类ID',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.entityId),
      cell: ({ row }) => String(row.getValue('parentId') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsXl),
      cell: ({ row }) => {
        const isRootCategory = row.original.parentId === '0'
        return actionGroup([
          isRootCategory
            ? actionButton('管理子分类', 'outline', (event) =>
                stopAndRun(event, () => options.openManageChildren(row.original)),
              )
            : null,
          actionButton('编辑', 'outline', (event) =>
            stopAndRun(event, () => options.openEdit(row.original)),
          ),
          actionButton('删除', 'destructive', (event) =>
            stopAndRun(event, () => options.handleDelete(row.original)),
          ),
        ])
      },
    },
  ]
}

export function createCategoryChildColumns(
  options: CrudColumnActions<CategoryVO>,
): ColumnDef<CategoryVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '子分类名',
      ...contentColumn(ADMIN_COLUMN_WIDTH.name),
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.sort),
      cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
