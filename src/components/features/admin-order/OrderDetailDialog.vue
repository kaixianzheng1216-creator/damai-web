<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/common/ui/dialog'
import { Badge } from '@/components/common/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import type { TicketOrderVO } from '@/api/trade'
import { formatPrice, formatDateTime } from '@/utils/format'
import { getOrderStatusBadgeClass } from '@/utils/statusMappers'

defineProps<{
  order: TicketOrderVO | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-2xl sm:max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto"
    >
      <DialogHeader class="pb-2">
        <DialogTitle>订单详情</DialogTitle>
        <DialogDescription v-if="order">
          订单号：{{ order.orderNo || order.id }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="order" class="space-y-5">
        <!-- 基本信息 -->
        <Card>
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-base">基本信息</CardTitle>
              <Badge :class="getOrderStatusBadgeClass(order.status)">
                {{ order.statusLabel }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-muted-foreground">活动名称</p>
                <p class="font-medium">{{ order.eventNameSnapshot || '--' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">用户 ID</p>
                <p class="font-medium">{{ order.userId || '--' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">场馆</p>
                <p class="font-medium">{{ order.venueNameSnapshot || '--' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">场馆地址</p>
                <p class="font-medium">{{ order.venueAddressSnapshot || '--' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">场次</p>
                <p class="font-medium">{{ order.sessionNameSnapshot || '--' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">场次时间</p>
                <p class="font-medium">
                  {{
                    order.sessionStartAtSnapshot
                      ? formatDateTime(order.sessionStartAtSnapshot)
                      : '--'
                  }}
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">票档</p>
                <p class="font-medium">{{ order.ticketTypeNameSnapshot || '--' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">数量</p>
                <p class="font-medium">{{ order.quantity ?? 0 }} 张</p>
              </div>
              <div>
                <p class="text-muted-foreground">单价</p>
                <p class="font-medium">{{ formatPrice(order.unitPrice ?? 0) }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">订单金额</p>
                <p class="font-medium text-primary text-base">
                  {{ formatPrice(order.totalAmount ?? 0) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 支付记录 -->
        <Card v-if="order.payments?.length">
          <CardHeader class="pb-3">
            <CardTitle class="text-base">支付记录</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="payment in order.payments"
              :key="payment.id"
              class="rounded-lg bg-muted/30 p-3 space-y-2 text-sm"
            >
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">支付单号</span>
                <span class="font-mono">{{ payment.paymentNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">支付金额</span>
                <span class="font-medium text-primary">{{ formatPrice(payment.amount) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">支付渠道</span>
                <span>{{ payment.channelLabel }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">支付方式</span>
                <span>{{ payment.payMethodLabel }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">状态</span>
                <Badge variant="outline">{{ payment.statusLabel }}</Badge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">支付时间</span>
                <span>{{ formatDateTime(payment.createAt) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 退款记录 -->
        <Card v-if="order.refunds?.length">
          <CardHeader class="pb-3">
            <CardTitle class="text-base">退款记录</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="refund in order.refunds"
              :key="refund.id"
              class="rounded-lg bg-muted/30 p-3 space-y-2 text-sm"
            >
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">退款单号</span>
                <span class="font-mono">{{ refund.refundNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">退款金额</span>
                <span class="font-medium text-primary">{{ formatPrice(refund.amount) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">退款状态</span>
                <Badge variant="outline">{{ refund.statusLabel }}</Badge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">申请时间</span>
                <span>{{ formatDateTime(refund.createAt) }}</span>
              </div>
              <div v-if="refund.reason" class="pt-2 border-t border-border/50">
                <span class="text-muted-foreground">退款原因</span>
                <p class="mt-1">{{ refund.reason }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 时间线 -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">订单时间线</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">创建时间</span>
              <span>{{ formatDateTime(order.createAt) }}</span>
            </div>
            <div v-if="order.payTime" class="flex items-center justify-between">
              <span class="text-muted-foreground">支付时间</span>
              <span>{{ formatDateTime(order.payTime) }}</span>
            </div>
            <div v-if="order.cancelTime" class="flex items-center justify-between">
              <span class="text-muted-foreground">取消时间</span>
              <span>{{ formatDateTime(order.cancelTime) }}</span>
            </div>
            <div v-if="order.closeTime" class="flex items-center justify-between">
              <span class="text-muted-foreground">关闭时间</span>
              <span>{{ formatDateTime(order.closeTime) }}</span>
            </div>
            <div v-if="order.refundTime" class="flex items-center justify-between">
              <span class="text-muted-foreground">退款时间</span>
              <span>{{ formatDateTime(order.refundTime) }}</span>
            </div>
            <div v-if="order.expireAt" class="flex items-center justify-between">
              <span class="text-muted-foreground">过期时间</span>
              <span>{{ formatDateTime(order.expireAt) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  </Dialog>
</template>
