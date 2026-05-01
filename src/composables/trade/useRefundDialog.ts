import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createRefund, type TicketOrderVO } from '@/api/trade'
import { ORDER_STATUS, queryKeys } from '@/constants'
import { useDialog } from '@/composables/common'

interface UseRefundDialogOptions {
  order: MaybeRefOrGetter<TicketOrderVO | null | undefined>
}

export function useRefundDialog(options: UseRefundDialogOptions) {
  const queryClient = useQueryClient()
  const { open: showRefundDialog, openDialog, closeDialog } = useDialog()
  const currentOrder = computed(() => toValue(options.order))

  const canRefund = computed(() => {
    const order = currentOrder.value
    if (!order) {
      return false
    }

    const isPaidStatus = order.status === ORDER_STATUS.PAID
    const sessionTime = new Date(order.sessionStartAtSnapshot ?? '').getTime()
    const isBeforeSession = Number.isFinite(sessionTime) && sessionTime > Date.now()
    return isPaidStatus && isBeforeSession
  })

  const openRefundDialog = () => {
    if (canRefund.value) {
      openDialog()
    }
  }

  const refundMutation = useMutation({
    mutationFn: (reason: string) => {
      const order = currentOrder.value
      if (!order) {
        throw new Error('Order is required before creating a refund')
      }

      return createRefund(order.id, { reason })
    },
    onSuccess: async (_refund, _reason) => {
      const orderId = currentOrder.value?.id
      toast.success('退款申请已提交')
      closeDialog()

      if (!orderId) {
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trade.order(orderId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trade.orderStatus(orderId) }),
      ])
    },
    onError: () => {
      toast.error('退款申请失败，请稍后重试')
    },
  })

  return {
    showRefundDialog,
    canRefund,
    refundMutation,
    openRefundDialog,
    closeRefundDialog: closeDialog,
  }
}
