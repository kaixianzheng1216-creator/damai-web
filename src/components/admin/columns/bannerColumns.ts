import { h, type Ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { BannerVO, CityVO } from '@/api/event'
import { formatDateTime } from '@/utils/format'
import { editDeleteActions, type RowAction } from './columnUtils'
import { ADMIN_COLUMN_WIDTH, contentColumn, fixedColumn } from './columnWidths'

export function createBannerColumns(options: {
  citiesMap: Ref<Map<string, CityVO>>
  openEdit: RowAction<BannerVO>
  handleDelete: RowAction<BannerVO>
}): ColumnDef<BannerVO>[] {
  return [
    {
      accessorKey: 'title',
      header: '标题',
      ...contentColumn(ADMIN_COLUMN_WIDTH.title),
    },
    {
      accessorKey: 'imageUrl',
      header: 'PC 封面',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.image),
      cell: ({ row }) => {
        const url = row.original.imageUrl
        return url
          ? h('img', { src: url, class: 'h-10 w-auto rounded object-cover', alt: 'PC 封面' })
          : '-'
      },
    },
    {
      accessorKey: 'mobileImageUrl',
      header: '移动端封面',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.image),
      cell: ({ row }) => {
        const url = row.original.mobileImageUrl
        return url
          ? h('img', { src: url, class: 'h-10 w-auto rounded object-cover', alt: '移动端封面' })
          : '-'
      },
    },
    {
      accessorKey: 'cityId',
      header: '城市',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.city),
      cell: ({ row }) => {
        const cityId = String(row.getValue('cityId'))
        return options.citiesMap.value.get(cityId)?.name ?? cityId
      },
    },
    {
      accessorKey: 'jumpUrl',
      header: '跳转链接',
      ...contentColumn(ADMIN_COLUMN_WIDTH.url),
      cell: ({ row }) => {
        const url = row.original.jumpUrl
        return url
          ? h(
              'a',
              {
                href: url,
                target: '_blank',
                class: 'text-primary hover:underline truncate block',
              },
              url,
            )
          : '-'
      },
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.sort),
      cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
    },
    {
      accessorKey: 'displayStartAt',
      header: '展示开始时间',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.dateTime),
      cell: ({ row }) => formatDateTime(row.original.displayStartAt),
    },
    {
      accessorKey: 'displayEndAt',
      header: '展示结束时间',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.dateTime),
      cell: ({ row }) => formatDateTime(row.original.displayEndAt),
    },
    {
      id: 'actions',
      header: '操作',
      ...fixedColumn(ADMIN_COLUMN_WIDTH.actionsMd),
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
