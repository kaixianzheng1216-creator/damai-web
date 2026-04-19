import { ORDER_STATUS, TICKET_STATUS } from '@/constants'

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

export const getTicketStatusClass = (status: number): string => {
  switch (status) {
    case TICKET_STATUS.UNUSED:
      return 'bg-green-50 text-green-700 border border-green-200'
    case TICKET_STATUS.USED:
      return 'bg-gray-50 text-gray-600 border border-gray-200'
    case TICKET_STATUS.VOIDED:
      return 'bg-red-50 text-red-700 border border-red-200'
    case TICKET_STATUS.REFUNDED:
      return 'bg-orange-50 text-orange-700 border border-orange-200'
    default:
      return 'bg-transparent text-foreground border border-border'
  }
}

export const getOrderStatusBadgeClass = (status: number | string): string => {
  switch (Number(status)) {
    case ORDER_STATUS.PENDING:
      return 'bg-orange-50 text-orange-700 border border-orange-200'
    case ORDER_STATUS.PAID:
      return 'bg-green-50 text-green-700 border border-green-200'
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.CLOSED:
      return 'bg-gray-50 text-gray-600 border border-gray-200'
    case ORDER_STATUS.REFUNDED:
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    default:
      return 'bg-transparent text-foreground border border-border'
  }
}
