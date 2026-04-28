import { h, type Ref, type VNode } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import type {
  BannerVO,
  CategoryVO,
  CityVO,
  EventVO,
  NoticeVO,
  ParticipantVO,
  SeriesEventVO,
  ServiceGuaranteeOptionVO,
  ServiceGuaranteeVO,
  VenueVO,
} from '@/api/event'
import type { AdminVO, UserVO } from '@/api/account'
import type { TicketOrderVO, WorkOrderVO } from '@/api/trade'
import type { TicketVO } from '@/api/ticket/types'
import {
  BOOLEAN_TYPE,
  EVENT_STATUS,
  NOTICE_TYPE_LABEL,
  USER_STATUS,
  WORK_ORDER_STATUS,
} from '@/constants'
import { formatDateTime, formatPrice } from '@/utils/format'
import { getOrderStatusBadgeClass, getWorkOrderStatusBadgeClass } from '@/utils/statusMappers'

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

const accountStatusBadge = (status: number) =>
  h(
    Badge,
    { variant: 'outline' },
    { default: () => (status === USER_STATUS.NORMAL ? '正常' : '封禁') },
  )

const accountAvatarCell = (avatarUrl: string | undefined, alt: string) =>
  avatarUrl
    ? h('img', {
        src: avatarUrl,
        alt,
        class: 'h-8 w-8 rounded-full object-cover',
      })
    : null

export function createEventColumns(options: {
  openEdit: RowAction<EventVO>
  handleDelete: RowAction<EventVO>
  handlePublish: RowAction<EventVO>
  handleOffline: RowAction<EventVO>
}): ColumnDef<EventVO>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 100,
    },
    {
      accessorKey: 'name',
      header: '活动名称',
    },
    {
      accessorKey: 'cityNameSnapshot',
      header: '城市',
      size: 100,
    },
    {
      accessorKey: 'categoryNameSnapshot',
      header: '分类',
      size: 100,
    },
    {
      accessorKey: 'minPrice',
      header: '最低票价',
      size: 120,
      cell: ({ row }) => (row.original.minPrice != null ? formatPrice(row.original.minPrice) : '-'),
    },
    {
      accessorKey: 'statusLabel',
      header: '状态',
      size: 100,
      cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
    },
    {
      accessorKey: 'recommendWeight',
      header: '推荐权重',
      size: 100,
      cell: ({ row }) => row.original.recommendWeight ?? '-',
    },
    {
      id: 'actions',
      header: '操作',
      size: 280,
      cell: ({ row }) =>
        actionGroup([
          actionButton('编辑', 'outline', (event) =>
            stopAndRun(event, () => options.openEdit(row.original)),
          ),
          row.original.status === EVENT_STATUS.DRAFT
            ? actionButton('发布', 'outline', (event) =>
                stopAndRun(event, () => options.handlePublish(row.original)),
              )
            : null,
          row.original.status === EVENT_STATUS.PUBLISHED
            ? actionButton('下线', 'outline', (event) =>
                stopAndRun(event, () => options.handleOffline(row.original)),
              )
            : null,
          row.original.status === EVENT_STATUS.OFFLINE
            ? actionButton('上线', 'outline', (event) =>
                stopAndRun(event, () => options.handlePublish(row.original)),
              )
            : null,
          actionButton('删除', 'destructive', (event) =>
            stopAndRun(event, () => options.handleDelete(row.original)),
          ),
        ]),
    },
  ]
}

export function createAdminColumns(options: {
  openEdit: RowAction<AdminVO>
  toggleStatus: RowAction<AdminVO>
}): ColumnDef<AdminVO>[] {
  return [
    { accessorKey: 'id', header: 'ID', size: 180 },
    {
      accessorKey: 'avatarUrl',
      header: '头像',
      size: 80,
      cell: ({ row }) => accountAvatarCell(row.original.avatarUrl, `${row.original.username}头像`),
    },
    { accessorKey: 'username', header: '用户名' },
    { accessorKey: 'mobile', header: '手机号' },
    {
      accessorKey: 'status',
      header: '状态',
      size: 100,
      cell: ({ row }) => accountStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: '操作',
      size: 160,
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

export function createUserColumns(options: {
  toggleStatus: RowAction<UserVO>
}): ColumnDef<UserVO>[] {
  return [
    { accessorKey: 'id', header: 'ID', size: 180 },
    {
      accessorKey: 'avatarUrl',
      header: '头像',
      size: 80,
      cell: ({ row }) => accountAvatarCell(row.original.avatarUrl, `${row.original.username}头像`),
    },
    { accessorKey: 'username', header: '用户名' },
    { accessorKey: 'mobile', header: '手机号' },
    {
      accessorKey: 'status',
      header: '状态',
      size: 100,
      cell: ({ row }) => accountStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: '操作',
      size: 120,
      cell: ({ row }) =>
        actionButton(
          row.original.status === USER_STATUS.NORMAL ? '封禁' : '解封',
          row.original.status === USER_STATUS.NORMAL ? 'destructive' : 'default',
          (event) => stopAndRun(event, () => options.toggleStatus(row.original)),
        ),
    },
  ]
}

export function createWorkOrderColumns(options: {
  openDetail: RowAction<WorkOrderVO>
  requestClose: RowAction<WorkOrderVO>
}): ColumnDef<WorkOrderVO>[] {
  return [
    { accessorKey: 'id', header: 'ID', size: 120 },
    { accessorKey: 'workOrderNo', header: '工单号', size: 180 },
    { accessorKey: 'title', header: '标题' },
    { accessorKey: 'userId', header: '用户 ID', size: 120 },
    { accessorKey: 'typeLabel', header: '类型', size: 120 },
    {
      accessorKey: 'status',
      header: '状态',
      size: 120,
      cell: ({ row }) =>
        h(
          Badge,
          { class: getWorkOrderStatusBadgeClass(row.original.status) },
          () => row.original.statusLabel,
        ),
    },
    {
      accessorKey: 'lastReplyAt',
      header: '最后回复',
      size: 160,
      cell: ({ row }) => formatDateTime(row.original.lastReplyAt, '-'),
    },
    {
      id: 'actions',
      header: '操作',
      size: 180,
      cell: ({ row }) =>
        actionGroup([
          actionButton('详情', 'outline', (event) =>
            stopAndRun(event, () => options.openDetail(row.original)),
          ),
          row.original.status !== WORK_ORDER_STATUS.CLOSED
            ? actionButton('关闭', 'destructive', (event) =>
                stopAndRun(event, () => options.requestClose(row.original)),
              )
            : null,
        ]),
    },
  ]
}

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

export function createOrderColumns(options: {
  openDetail: RowAction<TicketOrderVO>
}): ColumnDef<TicketOrderVO>[] {
  return [
    { accessorKey: 'orderNo', header: '订单号', size: 200 },
    { accessorKey: 'eventNameSnapshot', header: '活动名称' },
    {
      accessorKey: 'userId',
      header: '用户 ID',
      size: 120,
      cell: ({ row }) => String(row.getValue('userId') ?? ''),
    },
    {
      accessorKey: 'statusLabel',
      header: '状态',
      size: 100,
      cell: ({ row }) =>
        h(
          Badge,
          { class: getOrderStatusBadgeClass(row.original.status) },
          () => row.original.statusLabel,
        ),
    },
    {
      accessorKey: 'totalAmount',
      header: '金额',
      size: 120,
      cell: ({ row }) => formatPrice(Number(row.getValue('totalAmount') ?? 0)),
    },
    {
      accessorKey: 'quantity',
      header: '数量',
      size: 80,
      cell: ({ row }) => `${row.getValue('quantity') ?? 0} 张`,
    },
    {
      accessorKey: 'createAt',
      header: '创建时间',
      size: 170,
      cell: ({ row }) => (row.original.createAt ? formatDateTime(row.original.createAt) : '--'),
    },
    {
      accessorKey: 'payTime',
      header: '支付时间',
      size: 170,
      cell: ({ row }) => (row.original.payTime ? formatDateTime(row.original.payTime) : '--'),
    },
    {
      id: 'actions',
      header: '操作',
      size: 100,
      cell: ({ row }) =>
        actionGroup([
          actionButton('查看', 'outline', (event) =>
            stopAndRun(event, () => options.openDetail(row.original)),
          ),
        ]),
    },
  ]
}
