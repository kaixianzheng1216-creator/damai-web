import { h, type Ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { BannerVO, CityVO } from '@/api/event'
import { formatDateTime } from '@/utils/format'
import { editDeleteActions, type RowAction } from './columnUtils'

export function createBannerColumns(options: {
  citiesMap: Ref<Map<string, CityVO>>
  openEdit: RowAction<BannerVO>
  handleDelete: RowAction<BannerVO>
}): ColumnDef<BannerVO>[] {
  return [
    {
      accessorKey: 'title',
      header: '标题',
      size: 140,
    },
    {
      accessorKey: 'imageUrl',
      header: 'PC 封面',
      size: 80,
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
      size: 80,
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
      size: 100,
      cell: ({ row }) => {
        const cityId = String(row.getValue('cityId'))
        return options.citiesMap.value.get(cityId)?.name ?? cityId
      },
    },
    {
      accessorKey: 'jumpUrl',
      header: '跳转链接',
      size: 160,
      cell: ({ row }) => {
        const url = row.original.jumpUrl
        return url
          ? h(
              'a',
              {
                href: url,
                target: '_blank',
                class: 'text-primary hover:underline truncate block max-w-[140px]',
              },
              url,
            )
          : '-'
      },
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      size: 80,
      cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
    },
    {
      accessorKey: 'displayStartAt',
      header: '展示开始时间',
      size: 160,
      cell: ({ row }) => formatDateTime(row.original.displayStartAt),
    },
    {
      accessorKey: 'displayEndAt',
      header: '展示结束时间',
      size: 160,
      cell: ({ row }) => formatDateTime(row.original.displayEndAt),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}
