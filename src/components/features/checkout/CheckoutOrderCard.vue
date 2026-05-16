<script setup lang="ts">
import type { TicketOrderVO } from '@/api/trade'
import { PAYMENT_COPY } from '@/constants'
import { formatDateTime, formatPrice } from '@/utils/format'
import { Badge } from '@/components/common/ui/badge'

defineProps<{
  order: TicketOrderVO
  statusLabel: string
  remainText: string
  isPending: boolean
  isPaid: boolean
  isCancelled: boolean
  isClosed: boolean
}>()
</script>

<template>
  <section class="rounded-2xl border border-border bg-background p-5 shadow-sm">
    <div class="mb-5 flex items-center justify-between border-b border-border pb-4">
      <h1 class="text-xl font-semibold text-foreground">{{ PAYMENT_COPY.confirmPay }}</h1>
      <Badge variant="outline">{{ statusLabel }}</Badge>
    </div>

    <div class="grid gap-8 md:grid-cols-[220px_1fr]">
      <img
        :src="order.eventCoverUrlSnapshot"
        alt="订单封面"
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
          <div>
            <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.createTime }}</p>
            <p class="font-medium text-foreground">{{ formatDateTime(order.createAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.expireTime }}</p>
            <p class="font-medium text-foreground">{{ formatDateTime(order.expireAt ?? '') }}</p>
          </div>
          <div v-if="isClosed && order.closeTime">
            <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.closeTime }}</p>
            <p class="font-medium text-foreground">{{ formatDateTime(order.closeTime) }}</p>
          </div>
          <div v-if="order.refundTime">
            <p class="text-sm text-muted-foreground">{{ PAYMENT_COPY.refundTime }}</p>
            <p class="font-medium text-foreground">{{ formatDateTime(order.refundTime) }}</p>
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
</template>
