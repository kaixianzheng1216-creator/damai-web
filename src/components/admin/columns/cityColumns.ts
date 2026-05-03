import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { CityVO } from '@/api/event'
import { Button } from '@/components/common/ui/button'
import { editDeleteActions, stopAndRun, type RowAction } from './columnUtils'

export function createCityColumns(options: {
  toggleFeatured: RowAction<CityVO>
  openEdit: RowAction<CityVO>
  handleDelete: RowAction<CityVO>
}): ColumnDef<CityVO>[] {
  return [
    {
      accessorKey: 'name',
      header: '城市名',
      size: 140,
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'pinyin',
      header: '拼音',
      size: 140,
      cell: ({ row }) => String(row.getValue('pinyin')),
    },
    {
      accessorKey: 'firstLetter',
      header: '首字母',
      size: 80,
      cell: ({ row }) => String(row.getValue('firstLetter')),
    },
    {
      accessorKey: 'isFeatured',
      header: '热门',
      size: 100,
      cell: ({ row }) => {
        const isFeatured = row.original.isFeatured === 1
        return h(
          Button,
          {
            size: 'sm',
            variant: isFeatured ? 'default' : 'outline',
            class: 'h-6 px-2 text-xs',
            onClick: (event: Event) =>
              stopAndRun(event, () => options.toggleFeatured(row.original)),
          },
          () => (isFeatured ? '热门' : '普通'),
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
