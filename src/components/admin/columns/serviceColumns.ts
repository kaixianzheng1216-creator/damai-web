import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import type { ServiceGuaranteeOptionVO, ServiceGuaranteeVO } from '@/api/event'
import { BOOLEAN_TYPE } from '@/constants'
import {
  actionGroup,
  actionButton,
  stopAndRun,
  editDeleteActions,
  type RowAction,
  type CrudColumnActions,
} from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createServiceColumns(options: {
  openManageOptions: RowAction<ServiceGuaranteeVO>
  openEditService: RowAction<ServiceGuaranteeVO>
  handleDeleteService: RowAction<ServiceGuaranteeVO>
}): ColumnDef<ServiceGuaranteeVO>[] {
  return [
    { accessorKey: 'name', header: '服务名称', ...contentColumn(ADMIN_COLUMN_WIDTH.name) },
    { accessorKey: 'sortOrder', header: '排序', ...fixedColumn(ADMIN_COLUMN_WIDTH.sort) },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsXl),
      cell: ({ row }) =>
        actionGroup([
          actionButton('管理选项', 'outline', (event) =>
            stopAndRun(event, () => options.openManageOptions(row.original)),
          ),
          actionButton('编辑', 'outline', (event) =>
            stopAndRun(event, () => options.openEditService(row.original)),
          ),
          actionButton('删除', 'destructive', (event) =>
            stopAndRun(event, () => options.handleDeleteService(row.original)),
          ),
        ]),
    },
  ]
}

export function createServiceOptionColumns(
  options: CrudColumnActions<ServiceGuaranteeOptionVO>,
): ColumnDef<ServiceGuaranteeOptionVO>[] {
  return [
    { accessorKey: 'name', header: '选项名称', ...contentColumn(ADMIN_COLUMN_WIDTH.name) },
    {
      accessorKey: 'description',
      header: '描述',
      ...contentColumn(ADMIN_COLUMN_WIDTH.description),
    },
    {
      accessorKey: 'isBooleanType',
      header: '布尔类型',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.boolean),
      cell: ({ row }) => {
        const isBoolean = row.original.isBooleanType === BOOLEAN_TYPE.YES
        return h(Badge, { class: 'border border-border bg-transparent text-foreground' }, () =>
          isBoolean ? '是' : '否',
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
