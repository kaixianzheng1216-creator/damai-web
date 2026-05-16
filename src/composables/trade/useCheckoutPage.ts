import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNow } from '@vueuse/core'
import { toast } from 'vue3-toastify'
import type { PaymentVO } from '@/api/trade'
import {
  PAYMENT_CHANNELS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  TIME_UNITS,
  CHECKOUT_CONFIG,
  queryKeys,
  TOAST_COPY,
} from '@/constants'
import {
  fetchMyOrderById,
  fetchMyOrderStatus,
  createPayment,
  queryPaymentStatus,
  cancelTicketOrder,
} from '@/api/trade'
import type { OrderStatusVO } from '@/api/trade'
import {
  formatRemainText,
  getCheckoutStatusFlags,
  getRemainSeconds,
  resolveCheckoutPaymentInfo,
} from '@/utils/checkoutState'

export const useCheckoutPage = () => {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient()

  const orderId = computed(() => route.params.id as string)
  const now = useNow({ interval: TIME_UNITS.MILLISECONDS_PER_SECOND })

  const selectedChannel = ref<number>(PAYMENT_CHANNELS.ALIPAY)
  const selectedMethod = ref<number>(PAYMENT_METHODS.QR_CODE)
  const showQrCodeDialog = ref(false)
  const paymentData = ref<PaymentVO | null>(null)

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.trade.order(orderId),
    queryFn: () => fetchMyOrderById(orderId.value),
    enabled: computed(() => !!orderId.value),
  })

  const { data: status } = useQuery({
    queryKey: queryKeys.trade.orderStatus(orderId),
    queryFn: () => fetchMyOrderStatus(orderId.value),
    enabled: computed(() => !!orderId.value),
    refetchInterval: (query) => {
      const current = (query.state.data as OrderStatusVO | undefined)?.status ?? order.value?.status
      return showQrCodeDialog.value && getCheckoutStatusFlags(current ?? 0).isPending
        ? CHECKOUT_CONFIG.STATUS_REFETCH_INTERVAL_MS
        : false
    },
    refetchIntervalInBackground: false,
  })

  const currentStatus = computed((): number => status.value?.status ?? order.value?.status ?? 0)
  const statusLabel = computed((): string => order.value?.statusLabel ?? '待支付')

  const checkoutStatus = computed(() => getCheckoutStatusFlags(currentStatus.value))
  const isPending = computed((): boolean => checkoutStatus.value.isPending)
  const isPaid = computed((): boolean => checkoutStatus.value.isPaid)
  const isCancelled = computed((): boolean => checkoutStatus.value.isCancelled)
  const isClosed = computed((): boolean => checkoutStatus.value.isClosed)

  const remainSeconds = computed(() => getRemainSeconds(order.value?.expireAt, now.value))
  const remainText = computed(() => formatRemainText(remainSeconds.value))
  const paymentInfo = computed(() =>
    resolveCheckoutPaymentInfo(paymentData.value, order.value?.payments),
  )
  const paymentId = computed(() => paymentInfo.value.paymentId)
  const qrCodeBase64 = computed(() => paymentInfo.value.qrCodeBase64)
  const tradeNo = computed(() => paymentInfo.value.tradeNo)

  const assertPendingOrder = () => {
    if (!isPending.value) {
      throw new Error('Order is not pending')
    }
  }

  const refreshOrderQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.trade.orderStatus(orderId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.trade.order(orderId) }),
    ])

  watch(isPaid, (paid) => {
    if (paid) {
      showQrCodeDialog.value = false
      goOrders()
    }
  })

  const createPaymentMutation = useMutation({
    mutationFn: () => {
      assertPendingOrder()

      return createPayment(orderId.value, {
        channel: selectedChannel.value,
        payMethod: selectedMethod.value,
      })
    },
    onSuccess: async (data) => {
      paymentData.value = data
      showQrCodeDialog.value = true
      await refreshOrderQueries()
    },
    onError: () => {
      toast.error(TOAST_COPY.paymentCreateFailed)
    },
  })

  const queryPaymentMutation = useMutation({
    mutationFn: () => {
      assertPendingOrder()

      if (!paymentId.value) {
        throw new Error('Payment is not created')
      }

      return queryPaymentStatus(paymentId.value)
    },
    onSuccess: async (data) => {
      paymentData.value = data
      await refreshOrderQueries()

      if (data.status === PAYMENT_STATUS.SUCCESS) {
        toast.success(TOAST_COPY.paymentConfirmed)
        return
      }

      toast.info(TOAST_COPY.paymentStillPending)
    },
    onError: () => {
      toast.error(TOAST_COPY.paymentQueryFailed)
    },
  })

  const cancelTicketOrderMutation = useMutation({
    mutationFn: () => cancelTicketOrder(orderId.value),
    onSuccess: async () => {
      await refreshOrderQueries()
    },
    onError: () => {
      toast.error(TOAST_COPY.orderCancelFailed)
    },
  })

  const goOrders = () => {
    router.push({ path: '/profile', query: { section: 'orders' } })
  }

  const goDetail = () => {
    if (!order.value) {
      router.push('/')
      return
    }
    router.push(`/detail/${order.value.eventId}`)
  }

  return {
    order,
    isLoading,
    isError,
    selectedChannel,
    selectedMethod,
    showQrCodeDialog,
    createPaymentMutation,
    queryPaymentMutation,
    cancelTicketOrderMutation,
    statusLabel,
    remainText,
    isPending,
    isPaid,
    isCancelled,
    isClosed,
    qrCodeBase64,
    tradeNo,
    goOrders,
    goDetail,
  }
}
