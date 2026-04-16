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

export const getTicketStatusClass = (status: number) => {
  switch (status) {
    case TICKET_STATUS.UNUSED:
      return 'bg-blue-100 text-blue-700'
    case TICKET_STATUS.USED:
      return 'bg-emerald-100 text-emerald-700'
    case TICKET_STATUS.VOIDED:
      return 'bg-gray-100 text-gray-700'
    case TICKET_STATUS.REFUNDED:
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export const getOrderStatusBadgeClass = (status: number | string): string => {
  if (typeof status === 'string') {
    const statusMap: Record<string, string> = {
      '待付款': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '已支付': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      '已完成': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      '已取消': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return statusMap[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-700'
    case ORDER_STATUS.PAID:
      return 'bg-blue-100 text-blue-700'
    case ORDER_STATUS.REFUNDED:
      return 'bg-emerald-100 text-emerald-700'
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.CLOSED:
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
