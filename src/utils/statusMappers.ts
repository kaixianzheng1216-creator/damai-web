import { ORDER_STATUS } from '@/constants'

export const mapOrderStatus = (status: number): '待付款' | '已支付' | '已完成' | '已取消' => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return '待付款'
    case ORDER_STATUS.PAID:
      return '已支付'
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.CLOSED:
      return '已取消'
    case ORDER_STATUS.REFUNDED:
      return '已完成'
    default:
      return '已完成'
  }
}

export const getTicketStatusClass = (_status: number) => {
  return 'bg-transparent text-foreground border border-border'
}

export const getOrderStatusBadgeClass = (_status: number | string): string => {
  return 'bg-transparent text-foreground border border-border'
}
