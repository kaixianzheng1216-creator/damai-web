<script setup lang="ts">
import { PAYMENT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
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
} = useCheckoutPage()

const { showRefundDialog, canRefund, refundMutation, openRefundDialog, closeRefundDialog } =
  useRefundDialog({ order })

const handleCreatePayment = () => {
  if (!isPending.value || createPaymentMutation.isPending.value) {
    return
  }

  createPaymentMutation.mutate()
}

const handleCancelOrder = () => {
  if (!isPending.value || cancelTicketOrderMutation.isPending.value) {
    return
  }

  cancelTicketOrderMutation.mutate()
}

const handleQueryPayment = () => {
  if (!isPending.value || queryPaymentMutation.isPending.value) {
    return
  }

  queryPaymentMutation.mutate()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:px-6">
    <LoadingState v-if="isLoading" min-height="520px" />

    <ErrorState
      v-else-if="isError || !order"
      class="min-h-[520px]"
      :title="PAYMENT_COPY.loadFailed"
      description="请返回活动详情后重新进入结算。"
    >
      <template #action>
        <Button variant="outline" @click="goDetail">{{ PAYMENT_COPY.backHome }}</Button>
      </template>
    </ErrorState>

    <div v-else class="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
      <CheckoutOrderCard
        :order="order"
        :status-label="statusLabel"
        :remain-text="remainText"
        :is-pending="isPending"
        :is-paid="isPaid"
        :is-cancelled="isCancelled"
        :is-closed="isClosed"
      />

      <CheckoutPaymentPanel
        v-model:selected-channel="selectedChannel"
        v-model:selected-method="selectedMethod"
        :is-pending="isPending"
        :is-paid="isPaid"
        :is-cancelled="isCancelled"
        :is-closed="isClosed"
        :is-creating-payment="createPaymentMutation.isPending.value"
        :is-cancelling-order="cancelTicketOrderMutation.isPending.value"
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
        :is-querying-payment="queryPaymentMutation.isPending.value"
        @query-payment="handleQueryPayment"
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
