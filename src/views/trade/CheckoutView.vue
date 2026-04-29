<script setup lang="ts">
import { computed } from 'vue'
import { PAYMENT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import {
  CheckoutOrderCard,
  CheckoutPaymentPanel,
  CheckoutQrDialog,
} from '@/components/features/checkout'
import RefundDialog from '@/components/features/checkout/RefundDialog.vue'
import { useCheckoutPage } from '@/composables/trade/useCheckoutPage'
import { useRefundDialog } from '@/composables/trade/useRefundDialog'

const {
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
} = useCheckoutPage()

const isCreatingPayment = computed(() => createPaymentMutation.isPending.value)
const isCancellingOrder = computed(() => cancelTicketOrderMutation.isPending.value)

const { showRefundDialog, canRefund, refundMutation, openRefundDialog, closeRefundDialog } =
  useRefundDialog({ order })

const handleCreatePayment = () => {
  if (!isPending.value || isCreatingPayment.value) {
    return
  }

  createPaymentMutation.mutate()
}

const handleCancelOrder = () => {
  if (!isPending.value || isCancellingOrder.value) {
    return
  }

  cancelTicketOrderMutation.mutate()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:px-6">
    <div v-if="isLoading" class="flex min-h-[520px] items-center justify-center">
      <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div
      v-else-if="isError || !order"
      class="flex min-h-[520px] flex-col items-center justify-center gap-3"
    >
      <p class="text-destructive">{{ PAYMENT_COPY.loadFailed }}</p>
      <Button variant="outline" @click="goDetail">{{ PAYMENT_COPY.backHome }}</Button>
    </div>

    <div v-else class="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
      <CheckoutOrderCard
        :order="order"
        :status-label="statusLabel"
        :remain-text="remainText"
        :is-pending="isPending"
        :is-paid="isPaid"
        :is-cancelled="isCancelled"
        :is-closed="isClosed"
        :refunds="order.refunds"
      />

      <CheckoutPaymentPanel
        v-model:selected-channel="selectedChannel"
        v-model:selected-method="selectedMethod"
        :is-pending="isPending"
        :is-paid="isPaid"
        :is-cancelled="isCancelled"
        :is-closed="isClosed"
        :is-creating-payment="isCreatingPayment"
        :is-cancelling-order="isCancellingOrder"
        :can-refund="canRefund"
        @create-payment="handleCreatePayment"
        @cancel-order="handleCancelOrder"
        @go-orders="goOrders"
        @refund="openRefundDialog"
      />

      <CheckoutQrDialog
        v-model:open="showQrCodeDialog"
        :selected-channel="selectedChannel"
        :qr-code-base64="qrCodeBase64"
        :trade-no="tradeNo"
      />
    </div>

    <RefundDialog
      :open="showRefundDialog"
      :loading="refundMutation.isPending.value"
      @submit="refundMutation.mutate"
      @close="closeRefundDialog"
    />
  </div>
</template>
