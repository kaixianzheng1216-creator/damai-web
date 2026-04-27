import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyOrderPage } from '@/api/trade'
import {
  ORDER_PAGE_SIZE,
  ORDER_STATUS_BY_FILTER,
  queryKeys,
  type OrderFilterKey,
} from '@/constants'
import { formatPrice, formatDateTime } from '@/utils/format'
import { mapOrderStatus } from '@/utils/statusMappers'
import { usePagination, useQueryEnabled, type QueryEnabledOptions } from '@/composables/common'
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

export const useOrderList = (options: QueryEnabledOptions = {}) => {
  const enabled = useQueryEnabled(options.enabled)
  const orderFilter = ref<OrderFilter>('all')

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
    resetTriggers: [orderFilter],
  })

  // 计算要传递给后端的 status 参数
  const requestStatus = computed(() => {
    return ORDER_STATUS_BY_FILTER[orderFilter.value as Exclude<OrderFilter, 'all'>]
  })

  const myOrderPageQuery = useQuery({
    queryKey: queryKeys.profile.orders(orderPage, orderPageSize, requestStatus),
    queryFn: () =>
      fetchMyOrderPage({
        ...getPaginationParams(),
        status: requestStatus.value,
      }),
    enabled,
  })

  const orderList = computed<OrderItem[]>(
    () =>
      getRecords<TicketOrderVO>(myOrderPageQuery.data).value.map(mapTicketOrderToOrderItem) ?? [],
  )

  const orderTotalPages = getTotalPages(myOrderPageQuery.data)
  const orderTotalRow = getTotalRow(myOrderPageQuery.data)
  const paginatedOrders = computed(() => orderList.value)

  return {
    orderFilter,
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
