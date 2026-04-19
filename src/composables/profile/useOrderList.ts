import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyOrderPage } from '@/api/trade'
import { ORDER_PAGE_SIZE, ORDER_STATUS_BY_FILTER, type OrderFilterKey } from '@/constants'
import { formatPrice, formatDateTime } from '@/utils/format'
import { mapOrderStatus } from '@/utils/statusMappers'
import { usePagination } from '@/composables/common'
import type { OrderItem, OrderStatus } from '@/api/account'
import type { TicketOrderVO } from '@/api/trade'

type OrderFilter = OrderFilterKey

const mapTicketOrderToOrderItem = (order: TicketOrderVO): OrderItem => ({
  id: String(order.id),
  orderNo: order.orderNo,
  title: order.eventNameSnapshot || '订单标题',
  datetime: order.sessionStartAtSnapshot ? formatDateTime(order.sessionStartAtSnapshot) : '-',
  amount: order.totalAmount !== undefined ? formatPrice(order.totalAmount) : '-',
  status: order.status,
  statusLabel: (order.statusLabel || mapOrderStatus(order.status)) as OrderStatus,
})

export const useOrderList = () => {
  const orderFilter = ref<OrderFilter>('all')
  const orderKeyword = ref('')

  const {
    page: orderPage,
    pageSize: orderPageSize,
    updatePage: updateOrderPage,
    updatePageSize: updateOrderPageSize,
    getPaginationParams,
    getRecords,
    getTotalPages,
    getTotalRow,
  } = usePagination({
    initialPageSize: ORDER_PAGE_SIZE,
    resetTriggers: [orderFilter, orderKeyword],
  })

  // 计算要传递给后端的 status 参数
  const requestStatus = computed(() => {
    return ORDER_STATUS_BY_FILTER[orderFilter.value as Exclude<OrderFilter, 'all'>]
  })

  const myOrderPageQuery = useQuery({
    queryKey: ['my-order-page', orderPage, orderPageSize, requestStatus],
    queryFn: () =>
      fetchMyOrderPage({
        ...getPaginationParams(),
        status: requestStatus.value,
      }),
  })

  const orderList = computed<OrderItem[]>(
    () =>
      getRecords<TicketOrderVO>(myOrderPageQuery.data).value.map(mapTicketOrderToOrderItem) ?? [],
  )

  // 只对关键词进行前端过滤（后端暂不支持关键词搜索）
  const filteredOrders = computed(() => {
    const keyword = orderKeyword.value.trim()
    if (!keyword) {
      return orderList.value
    }
    return orderList.value.filter(
      (item) =>
        item.title.includes(keyword) ||
        item.id.includes(keyword) ||
        (item.orderNo && item.orderNo.includes(keyword)),
    )
  })

  const orderTotalPages = getTotalPages(myOrderPageQuery.data)
  const orderTotalRow = getTotalRow(myOrderPageQuery.data)
  const paginatedOrders = computed(() => filteredOrders.value)

  return {
    orderFilter,
    orderKeyword,
    orderPage,
    orderPageSize,
    myOrderPageQuery,
    paginatedOrders,
    orderTotalPages,
    orderTotalRow,
    updateOrderPage,
    updateOrderPageSize,
  }
}
