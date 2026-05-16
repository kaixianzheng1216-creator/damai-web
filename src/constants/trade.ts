export type OrderFilterKey = 'all' | 'pending' | 'paid' | 'done' | 'cancel' | 'refunded'
export type WorkOrderFilterKey = 'all' | 'pending' | 'processing' | 'closed'

export interface OrderFilterOption {
  key: OrderFilterKey
  label: string
}

export interface WorkOrderFilterOption {
  key: WorkOrderFilterKey
  label: string
}

export const ORDER_STATUS = {
  PENDING: 0,
  PAID: 1,
  CANCELLED: 2,
  CLOSED: 3,
  REFUNDED: 4,
} as const

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: '待付款',
  [ORDER_STATUS.PAID]: '已支付',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.CLOSED]: '已关闭',
  [ORDER_STATUS.REFUNDED]: '已退款',
} as const satisfies Record<OrderStatusValue, string>

export const PAYMENT_STATUS = {
  PENDING: 0,
  SUCCESS: 1,
  FAILED: 2,
} as const

export type PaymentStatusValue = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const TICKET_STATUS = {
  UNUSED: 0,
  USED: 1,
  VOIDED: 2,
  REFUNDED: 3,
} as const

export type TicketStatusValue = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]

export const TICKET_STATUS_LABEL = {
  [TICKET_STATUS.UNUSED]: '未使用',
  [TICKET_STATUS.USED]: '已使用',
  [TICKET_STATUS.VOIDED]: '已作废',
  [TICKET_STATUS.REFUNDED]: '已退款',
} as const satisfies Record<TicketStatusValue, string>

export const WORK_ORDER_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  CLOSED: 3,
} as const

export type WorkOrderStatusValue = (typeof WORK_ORDER_STATUS)[keyof typeof WORK_ORDER_STATUS]

export const WORK_ORDER_STATUS_LABEL = {
  [WORK_ORDER_STATUS.PENDING]: '待处理',
  [WORK_ORDER_STATUS.PROCESSING]: '处理中',
  [WORK_ORDER_STATUS.CLOSED]: '已关闭',
} as const satisfies Record<WorkOrderStatusValue, string>

export const ORDER_PAGE_SIZE = 10
export const WORK_ORDER_PAGE_SIZE = 10

export const ORDER_FILTER_OPTIONS: OrderFilterOption[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '已支付' },
  { key: 'done', label: '已完成' },
  { key: 'cancel', label: '已取消' },
  { key: 'refunded', label: '已退款' },
]

export const ORDER_STATUS_BY_FILTER: Partial<Record<Exclude<OrderFilterKey, 'all'>, number>> = {
  pending: ORDER_STATUS.PENDING,
  paid: ORDER_STATUS.PAID,
  done: ORDER_STATUS.CLOSED,
  cancel: ORDER_STATUS.CANCELLED,
  refunded: ORDER_STATUS.REFUNDED,
}

export const WORK_ORDER_FILTER_OPTIONS: WorkOrderFilterOption[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'closed', label: '已关闭' },
]

export const WORK_ORDER_STATUS_BY_FILTER: Partial<
  Record<Exclude<WorkOrderFilterKey, 'all'>, number>
> = {
  pending: WORK_ORDER_STATUS.PENDING,
  processing: WORK_ORDER_STATUS.PROCESSING,
  closed: WORK_ORDER_STATUS.CLOSED,
}

export const PAYMENT_CHANNELS = {
  ALIPAY: 1,
  WECHAT: 2,
} as const

export const PAYMENT_METHODS = {
  QR_CODE: 1,
} as const

export interface PaymentChannelOption {
  value: number
  label: string
  disabled?: boolean
}

export interface PaymentMethodOption {
  value: number
  label: string
  disabled?: boolean
}

export const PAYMENT_CHANNEL_OPTIONS: PaymentChannelOption[] = [
  { value: PAYMENT_CHANNELS.ALIPAY, label: '支付宝' },
  { value: PAYMENT_CHANNELS.WECHAT, label: '微信支付', disabled: true },
]

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { value: PAYMENT_METHODS.QR_CODE, label: '扫码支付' },
]

export const PAYMENT_COPY = {
  loadFailed: '订单加载失败，请稍后重试',
  backHome: '返回首页',
  confirmPay: '确认支付',
  venue: '场馆',
  venueAddress: '场馆地址',
  ticketTier: '票档',
  unitPrice: '单价',
  session: '场次',
  time: '时间',
  payTime: '支付时间',
  cancelTime: '取消时间',
  orderNo: '订单号',
  amount: '支付金额',
  pendingDescPrefix: '请在',
  pendingDescSuffix: '内完成支付，超时订单将自动关闭。',
  paidAt: '支付完成时间：',
  closedDesc: '订单已关闭，请返回详情页重新下单。',
  selectPaymentChannel: '选择支付渠道',
  selectPaymentMethod: '选择支付方式',
  qrCodeAlt: '支付二维码',
  tradeNo: '交易号：',
  payNow: '立即支付',
  qrPay: '扫码支付',
  queryPaymentStatus: '查询支付结果',
  cancelOrder: '取消订单',
  paid: '已支付',
  cancelled: '已取消',
  closed: '已关闭',
  refunded: '已退款',
  backToOrders: '返回订单列表',
  scanQrPay: '扫码支付',
  generatingQrCode: '正在生成二维码...',
  close: '关闭',
  notAvailable: '暂未开放',
  alipay: '支付宝',
  wechat: '微信',
  refreshStatus: '刷新支付状态',
  backDetail: '返回详情',
  viewOrders: '查看订单',
  createTime: '创建时间',
  expireTime: '过期时间',
  closeTime: '关闭时间',
  refundTime: '退款时间',
  paymentRecords: '支付记录',
  paymentNo: '支付单号',
  channel: '支付渠道',
  payMethod: '支付方式',
  outTradeNo: '商户订单号',
  channelTradeNo: '渠道交易号',
} as const

export const CHECKOUT_CONFIG = {
  STATUS_REFETCH_INTERVAL_MS: 2000,
} as const
