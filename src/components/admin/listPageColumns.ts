import { h, type Ref, type VNode } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import type {
  BannerVO,
  CategoryVO,
  CityVO,
  NoticeVO,
  ParticipantVO,
  SeriesEventVO,
  ServiceGuaranteeOptionVO,
  ServiceGuaranteeVO,
  VenueVO,
} from '@/api/event'
import type { TicketVO } from '@/api/ticket/types'
import { BOOLEAN_TYPE, NOTICE_TYPE_LABEL } from '@/constants'
import { formatDateTime } from '@/utils/format'

type RowAction<T> = (row: T) => void

interface CrudColumnActions<T> {
  openEdit: RowAction<T>
  handleDelete: RowAction<T>
}

const stopAndRun = (event: Event, action: () => void) => {
  event.stopPropagation()
  action()
}

const actionButton = (
  label: string,
  variant: 'default' | 'outline' | 'destructive',
  onClick: (event: Event) => void,
) => h(Button, { size: 'sm', variant, onClick }, () => label)

const actionGroup = (buttons: Array<VNode | null>) =>
  h('div', { class: 'flex items-center gap-2' }, buttons.filter(Boolean))

const editDeleteActions = <T>(row: T, { openEdit, handleDelete }: CrudColumnActions<T>) =>
  actionGroup([
    actionButton('编辑', 'outline', (event) => stopAndRun(event, () => openEdit(row))),
    actionButton('删除', 'destructive', (event) => stopAndRun(event, () => handleDelete(row))),
  ])

export function createBannerColumns(options: {
  citiesMap: Ref<Map<string, CityVO>>
  openEdit: RowAction<BannerVO>
  handleDelete: RowAction<BannerVO>
}): ColumnDef<BannerVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 100,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      accessorKey: 'title',
      header: '标题',
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

export function createCategoryColumns(options: {
  openManageChildren: RowAction<CategoryVO>
  openEdit: RowAction<CategoryVO>
  handleDelete: RowAction<CategoryVO>
}): ColumnDef<CategoryVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      accessorKey: 'name',
      header: '分类名',
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      size: 80,
      cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
    },
    {
      accessorKey: 'parentId',
      header: '父分类ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('parentId') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      size: 240,
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
      accessorKey: 'id',
      header: 'ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      accessorKey: 'name',
      header: '子分类名',
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      size: 80,
      cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}

export function createServiceColumns(options: {
  openManageOptions: RowAction<ServiceGuaranteeVO>
  openEditService: RowAction<ServiceGuaranteeVO>
  handleDeleteService: RowAction<ServiceGuaranteeVO>
}): ColumnDef<ServiceGuaranteeVO>[] {
  return [
    { accessorKey: 'id', header: 'ID', size: 180 },
    { accessorKey: 'name', header: '服务名称' },
    { accessorKey: 'sortOrder', header: '排序', size: 100 },
    {
      id: 'actions',
      header: '操作',
      size: 240,
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
    { accessorKey: 'id', header: 'ID', size: 120 },
    { accessorKey: 'name', header: '选项名称', size: 150 },
    { accessorKey: 'description', header: '描述' },
    {
      accessorKey: 'isBooleanType',
      header: '布尔类型',
      size: 100,
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
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}

export function createNoticeColumns(options: CrudColumnActions<NoticeVO>): ColumnDef<NoticeVO>[] {
  return [
    { accessorKey: 'id', header: 'ID', size: 180 },
    {
      accessorKey: 'type',
      header: '类型',
      size: 120,
      cell: ({ row }) => {
        const type = row.original.type
        return h(
          Badge,
          { class: 'border border-border bg-transparent text-foreground' },
          () => NOTICE_TYPE_LABEL[type] ?? type,
        )
      },
    },
    { accessorKey: 'name', header: '名称' },
    { accessorKey: 'sortOrder', header: '排序', size: 100 },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}

export function createCityColumns(options: {
  toggleFeatured: RowAction<CityVO>
  openEdit: RowAction<CityVO>
  handleDelete: RowAction<CityVO>
}): ColumnDef<CityVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      accessorKey: 'name',
      header: '城市名',
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'pinyin',
      header: '拼音',
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

export function createVenueColumns(options: CrudColumnActions<VenueVO>): ColumnDef<VenueVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      accessorKey: 'name',
      header: '场馆名',
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      accessorKey: 'province',
      header: '省份',
      size: 100,
      cell: ({ row }) => String(row.getValue('province') ?? ''),
    },
    {
      accessorKey: 'city',
      header: '城市',
      size: 100,
      cell: ({ row }) => String(row.getValue('city') ?? ''),
    },
    {
      accessorKey: 'district',
      header: '区县',
      size: 100,
      cell: ({ row }) => String(row.getValue('district') ?? ''),
    },
    {
      accessorKey: 'address',
      header: '地址',
      cell: ({ row }) => String(row.getValue('address') ?? ''),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}

export function createParticipantColumns(
  options: CrudColumnActions<ParticipantVO>,
): ColumnDef<ParticipantVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      id: 'avatar',
      header: '头像',
      size: 100,
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
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}

export function createSeriesColumns(
  options: CrudColumnActions<SeriesEventVO>,
): ColumnDef<SeriesEventVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 180,
      cell: ({ row }) => String(row.getValue('id')),
    },
    {
      accessorKey: 'name',
      header: '系列名称',
      cell: ({ row }) => String(row.getValue('name')),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
      cell: ({ row }) => editDeleteActions(row.original, options),
    },
  ]
}

export function createTicketColumns(): ColumnDef<TicketVO>[] {
  return [
    { accessorKey: 'id', header: 'ID', size: 100 },
    { accessorKey: 'ticketNo', header: '票号', size: 200 },
    { accessorKey: 'eventNameSnapshot', header: '活动' },
    { accessorKey: 'sessionNameSnapshot', header: '场次' },
    { accessorKey: 'ticketTypeNameSnapshot', header: '票档', size: 100 },
    { accessorKey: 'passengerNameSnapshot', header: '购票人', size: 100 },
    {
      accessorKey: 'status',
      header: '状态',
      size: 100,
      cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
    },
    {
      accessorKey: 'createAt',
      header: '创建时间',
      size: 160,
      cell: ({ row }) => (row.original.createAt ? formatDateTime(row.original.createAt) : '--'),
    },
  ]
}
