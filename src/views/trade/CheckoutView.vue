<script setup lang="ts">
import {
  PAYMENT_COPY,
  PAYMENT_CHANNELS,
  PAYMENT_CHANNEL_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '@/constants'
import { formatPrice, formatDateTime } from '@/utils/format'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio-group'
import { Label } from '@/components/common/ui/label'
import { Badge } from '@/components/common/ui/badge'
import IconAlipay from '@/components/common/icons/IconAlipay.vue'
import IconWechatPay from '@/components/common/icons/IconWechatPay.vue'
import { useCheckoutPage } from '@/composables/trade/useCheckoutPage'

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

const selectedMethodStr = computed({
  get: () => String(selectedMethod.value),
  set: (val: string) => {
    selectedMethod.value = Number(val)
  },
})
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
      <section class="rounded-2xl border border-border bg-background p-5 shadow-sm">
        <div class="mb-5 flex items-center justify-between border-b border-border pb-4">
          <h1 class="text-xl font-semibold text-foreground">{{ PAYMENT_COPY.confirmPay }}</h1>
          <Badge variant="outline">{{ statusLabel }}</Badge>
        </div>

        <div class="grid gap-8 md:grid-cols-[220px_1fr]">
          <img
            :src="order.eventCoverUrlSnapshot"
            :alt="order.eventNameSnapshot"
            class="h-[293px] w-[220px] rounded-lg border border-border object-cover"
          />
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-foreground">{{ order.eventNameSnapshot }}</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.venue }}</p>
                <p class="font-medium text-foreground">{{ order.venueNameSnapshot }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.venueAddress }}</p>
                <p class="font-medium text-foreground">{{ order.venueAddressSnapshot }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.ticketTier }}</p>
                <p class="font-medium text-foreground">
                  {{ order.ticketTypeNameSnapshot }} x {{ order.quantity }}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.unitPrice }}</p>
                <p class="font-medium text-foreground">{{ formatPrice(order.unitPrice ?? 0) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.orderNo }}</p>
                <p class="font-medium text-foreground">{{ order.orderNo }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.session }}</p>
                <p class="font-medium text-foreground">{{ order.sessionNameSnapshot }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.time }}</p>
                <p class="font-medium text-foreground">
                  {{ formatDateTime(order.sessionStartAtSnapshot ?? '') }}
                </p>
              </div>
              <div v-if="isPaid && order.payTime">
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.payTime }}</p>
                <p class="font-medium text-foreground">{{ formatDateTime(order.payTime) }}</p>
              </div>
              <div v-if="isCancelled && order.cancelTime">
                <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.cancelTime }}</p>
                <p class="font-medium text-foreground">{{ formatDateTime(order.cancelTime) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 rounded-xl bg-muted/30 p-5">
          <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.amount }}</p>
          <p class="mt-2 text-3xl font-bold text-primary">
            {{ formatPrice(order.totalAmount ?? 0) }}
          </p>
          <p v-if="isPending" class="mt-2 text-xs text-muted-foreground">
            {{ PAYMENT_COPY.pendingDescPrefix }} {{ remainText }}
            {{ PAYMENT_COPY.pendingDescSuffix }}
          </p>
          <p v-else-if="isPaid" class="mt-2 text-xs text-emerald-700">
            {{ PAYMENT_COPY.paidAt }}{{ formatDateTime(order.payTime ?? '') }}
          </p>
          <p v-else-if="isCancelled || isClosed" class="mt-2 text-xs text-muted-foreground">
            {{ PAYMENT_COPY.closedDesc }}
          </p>
        </div>
      </section>

      <aside class="rounded-2xl border border-border bg-background p-5 shadow-sm">
        <h3 class="text-base font-semibold text-foreground">
          {{ PAYMENT_COPY.selectPaymentChannel }}
        </h3>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            v-for="channel in PAYMENT_CHANNEL_OPTIONS"
            :key="channel.value"
            type="button"
            class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all"
            :class="[
              selectedChannel === channel.value
                ? 'border-foreground/30 bg-muted/40 shadow-sm'
                : 'border-border hover:border-foreground/20',
              !isPending || channel.disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            :disabled="!isPending || channel.disabled"
            @click="isPending && !channel.disabled && (selectedChannel = channel.value)"
          >
            <IconAlipay v-if="channel.value === PAYMENT_CHANNELS.ALIPAY" class="h-8 w-8" />
            <IconWechatPay v-else-if="channel.value === PAYMENT_CHANNELS.WECHAT" class="h-8 w-8" />
            <icon-lucide-credit-card v-else class="h-8 w-8" />
            <span class="text-sm font-medium text-foreground">{{ channel.label }}</span>
            <span v-if="channel.disabled" class="text-xs text-muted-foreground">{{
              PAYMENT_COPY.notAvailable
            }}</span>
          </button>
        </div>

        <h3 class="mt-6 text-base font-semibold text-foreground">
          {{ PAYMENT_COPY.selectPaymentMethod }}
        </h3>
        <RadioGroup v-model="selectedMethodStr" class="mt-3 space-y-2" :disabled="!isPending">
          <div
            v-for="method in PAYMENT_METHOD_OPTIONS"
            :key="method.value"
            class="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors"
            :class="[
              !isPending || method.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-muted/30 cursor-pointer',
            ]"
          >
            <RadioGroupItem
              :id="`method-${method.value}`"
              :value="String(method.value)"
              :disabled="!isPending || method.disabled"
            />
            <Label
              :for="`method-${method.value}`"
              class="text-sm font-normal"
              :class="{
                'cursor-pointer': isPending && !method.disabled,
                'cursor-not-allowed': !isPending || method.disabled,
              }"
            >
              {{ method.label }}
            </Label>
            <span v-if="method.disabled" class="text-xs text-muted-foreground ml-auto">{{
              PAYMENT_COPY.notAvailable
            }}</span>
          </div>
        </RadioGroup>

        <div class="mt-6 space-y-3">
          <Button
            class="w-full"
            :disabled="!isPending || createPaymentMutation.isPending.value"
            @click="isPending && createPaymentMutation.mutate()"
          >
            <icon-lucide-loader2
              v-if="createPaymentMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            <icon-lucide-qr-code v-else class="mr-2 h-4 w-4" />
            {{ PAYMENT_COPY.qrPay }}
          </Button>
          <Button
            v-if="isPending"
            variant="outline"
            class="w-full"
            :disabled="cancelTicketOrderMutation.isPending.value"
            @click="cancelTicketOrderMutation.mutate()"
          >
            <icon-lucide-loader2
              v-if="cancelTicketOrderMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ PAYMENT_COPY.cancelOrder }}
          </Button>
          <Button v-else variant="outline" class="w-full" disabled>
            <icon-lucide-check-circle class="mr-2 h-4 w-4" />
            {{
              isPaid
                ? PAYMENT_COPY.paid
                : isCancelled
                  ? PAYMENT_COPY.cancelled
                  : isClosed
                    ? PAYMENT_COPY.closed
                    : PAYMENT_COPY.refunded
            }}
          </Button>
          <Button variant="outline" class="w-full" @click="goOrders">
            {{ PAYMENT_COPY.backToOrders }}
          </Button>
        </div>
      </aside>

      <Dialog :open="showQrCodeDialog" @update:open="(val) => (showQrCodeDialog = val)">
        <DialogContent class="max-w-sm">
          <DialogHeader>
            <DialogTitle>{{ PAYMENT_COPY.scanQrPay }}</DialogTitle>
            <DialogDescription>
              请使用
              {{
                selectedChannel === PAYMENT_CHANNELS.ALIPAY
                  ? PAYMENT_COPY.alipay
                  : PAYMENT_COPY.wechat
              }}
              扫码完成支付
            </DialogDescription>
          </DialogHeader>
          <div class="py-2">
            <div v-if="qrCodeBase64" class="text-center">
              <img
                :src="qrCodeBase64"
                :alt="PAYMENT_COPY.qrCodeAlt"
                class="mx-auto h-52 w-52 rounded-md border border-border"
              />
              <p class="mt-2 text-xs text-muted-foreground">
                {{ PAYMENT_COPY.tradeNo }}{{ tradeNo }}
              </p>
            </div>
            <div v-else class="text-center py-8">
              <icon-lucide-loader2 class="mx-auto h-8 w-8 animate-spin text-primary" />
              <p class="mt-2 text-sm text-muted-foreground">{{ PAYMENT_COPY.generatingQrCode }}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="showQrCodeDialog = false">{{
              PAYMENT_COPY.close
            }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
