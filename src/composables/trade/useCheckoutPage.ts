import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNow } from '@vueuse/core'
import { toast } from 'vue3-toastify'
import type { PaymentVO } from '@/api/trade'
import {
  ORDER_STATUS,
  PAYMENT_CHANNELS,
  PAYMENT_METHODS,
  TIME_UNITS,
  CHECKOUT_CONFIG,
} from '@/constants'
import { fetchOrderById, fetchOrderStatus, createPayment, cancelTicketOrder } from '@/api/trade'

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
    queryKey: ['ticket-order', orderId],
    queryFn: () => fetchOrderById(orderId.value),
    enabled: computed(() => !!orderId.value),
  })

  const { data: status } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: () => fetchOrderStatus(orderId.value),
    enabled: computed(() => !!orderId.value),
    refetchInterval: CHECKOUT_CONFIG.STATUS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  })

  const currentStatus = computed((): number => status.value?.status ?? order.value?.status ?? 0)
  const statusLabel = computed((): string => order.value?.statusLabel ?? '待支付')

  const isPending = computed((): boolean => currentStatus.value === ORDER_STATUS.PENDING)
  const isPaid = computed((): boolean => currentStatus.value === ORDER_STATUS.PAID)
  const isCancelled = computed((): boolean => currentStatus.value === ORDER_STATUS.CANCELLED)
  const isClosed = computed((): boolean => currentStatus.value === ORDER_STATUS.CLOSED)
  const isRefunded = computed((): boolean => currentStatus.value === ORDER_STATUS.REFUNDED)

  const remainSeconds = computed(() => {
    if (!order.value?.expireAt) return 0
    const left = Math.floor(
      (new Date(order.value.expireAt).getTime() - now.value.getTime()) /
        TIME_UNITS.MILLISECONDS_PER_SECOND,
    )
    return Math.max(0, left)
  })

  const remainText = computed(() => {
    const minutes = String(
      Math.floor(remainSeconds.value / TIME_UNITS.SECONDS_PER_MINUTE),
    ).padStart(2, '0')
    const seconds = String(remainSeconds.value % TIME_UNITS.SECONDS_PER_MINUTE).padStart(2, '0')
    return `${minutes}:${seconds}`
  })

  const qrCodeBase64 = computed(
    () => paymentData.value?.qrCodeBase64 || order.value?.payments?.[0]?.qrCodeBase64 || '',
  )

  const tradeNo = computed(
    () =>
      paymentData.value?.outTradeNo ||
      paymentData.value?.paymentNo ||
      order.value?.payments?.[0]?.outTradeNo ||
      order.value?.payments?.[0]?.paymentNo ||
      '',
  )

  watch(isPaid, (paid) => {
    if (paid) {
      showQrCodeDialog.value = false
      goOrders()
    }
  })

  const createPaymentMutation = useMutation({
    mutationFn: () =>
      createPayment(orderId.value, {
        channel: selectedChannel.value,
        payMethod: selectedMethod.value,
      }),
    onSuccess: async (data) => {
      paymentData.value = data
      showQrCodeDialog.value = true
      await queryClient.invalidateQueries({ queryKey: ['order-status', orderId] })
      await queryClient.invalidateQueries({ queryKey: ['ticket-order', orderId] })
    },
    onError: () => {
      toast.error('创建支付失败，请重试')
    },
  })

  const cancelTicketOrderMutation = useMutation({
    mutationFn: () => cancelTicketOrder(orderId.value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['order-status', orderId] })
      await queryClient.invalidateQueries({ queryKey: ['ticket-order', orderId] })
    },
    onError: () => {
      toast.error('取消订单失败，请重试')
    },
  })

  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['order-status', orderId] })
  }

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
