import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyOrderPage } from '@/api/trade'
import { ORDER_PAGE_SIZE, ORDER_STATUS_BY_FILTER, type OrderFilterKey } from '@/constants'
import { formatPrice, formatDateTime } from '@/utils/format'
import { mapOrderStatus } from '@/utils/statusMappers'
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
  const orderPage = ref(1)
  const orderPageSize = ref(ORDER_PAGE_SIZE)

  // 计算要传递给后端的 status 参数
  const requestStatus = computed(() => {
    return ORDER_STATUS_BY_FILTER[orderFilter.value as Exclude<OrderFilter, 'all'>]
  })

  const myOrderPageQuery = useQuery({
    queryKey: ['my-order-page', orderPage, orderPageSize, requestStatus],
    queryFn: () =>
      fetchMyOrderPage({
        page: orderPage.value,
        size: orderPageSize.value,
        status: requestStatus.value,
      }),
  })

  const orderList = computed<OrderItem[]>(
    () => myOrderPageQuery.data.value?.records.map(mapTicketOrderToOrderItem) ?? [],
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

  const orderTotalPages = computed(() => myOrderPageQuery.data.value?.totalPage ?? 1)

  const orderTotalRow = computed(() => {
    return myOrderPageQuery.data.value?.totalRow ?? 0
  })

  const paginatedOrders = computed(() => filteredOrders.value)

  watch([orderFilter, orderKeyword], () => {
    orderPage.value = 1
  })

  const updateOrderPage = (page: number) => {
    if (page < 1) {
      return
    }

    orderPage.value = page
  }

  const updateOrderPageSize = (pageSize: number) => {
    if (pageSize < 1) {
      return
    }

    orderPageSize.value = pageSize
    orderPage.value = 1
  }

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
