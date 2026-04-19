<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchOrderById } from '@/api/trade'
import { formatPrice, formatDateTime } from '@/utils/format'
import { getOrderStatusBadgeClass } from '@/utils/statusMappers'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => route.params.id as string)

const {
  data: order,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['order-detail', orderId],
  queryFn: () => fetchOrderById(orderId.value),
  enabled: computed(() => !!orderId.value),
})

const goBack = () => {
  router.back()
}

const goToPayment = () => {
  router.push(`/checkout/${orderId.value}`)
}
</script>

<template>
  <div class="bg-background min-h-screen py-6">
    <div class="container mx-auto px-4 md:px-6">
      <div class="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" @click="goBack" class="mb-6">
          <icon-lucide-arrow-left class="h-4 w-4 mr-2" />
          返回
        </Button>

        <div v-if="isLoading" class="flex min-h-[400px] items-center justify-center">
          <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div
          v-else-if="isError"
          class="rounded-xl border border-border bg-background p-8 text-center"
        >
          <icon-lucide-alert-circle class="h-12 w-12 mx-auto text-destructive mb-4" />
          <p class="text-destructive">订单加载失败，请稍后重试</p>
          <Button variant="outline" @click="goBack" class="mt-4"> 返回 </Button>
        </div>

        <template v-else-if="order">
          <div class="space-y-6">
            <Card class="overflow-hidden">
              <CardHeader class="bg-muted/50 border-b border-border pb-4">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle class="text-xl">{{
                      order.eventNameSnapshot || '订单详情'
                    }}</CardTitle>
                    <p class="mt-1 text-sm text-muted-foreground">
                      订单号：{{ order.orderNo || order.id }}
                    </p>
                  </div>
                  <Badge :class="getOrderStatusBadgeClass(order.status)">{{
                    order.statusLabel
                  }}</Badge>
                </div>
              </CardHeader>
              <CardContent class="pt-6">
                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="order.eventNameSnapshot">
                      <p class="text-sm text-muted-foreground">活动名称</p>
                      <p class="font-medium text-foreground">{{ order.eventNameSnapshot }}</p>
                    </div>
                    <div v-if="order.sessionStartAtSnapshot">
                      <p class="text-sm text-muted-foreground">场次</p>
                      <p class="font-medium text-foreground flex items-center gap-1">
                        <icon-lucide-calendar class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {{ formatDateTime(order.sessionStartAtSnapshot) }}
                      </p>
                    </div>
                    <div v-if="order.venueNameSnapshot">
                      <p class="text-sm text-muted-foreground">场馆</p>
                      <p class="font-medium text-foreground flex items-center gap-1">
                        <icon-lucide-building-2
                          class="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        />
                        {{ order.venueNameSnapshot }}
                      </p>
                    </div>
                    <div v-if="order.venueAddressSnapshot">
                      <p class="text-sm text-muted-foreground">场馆地址</p>
                      <p class="font-medium text-foreground flex items-center gap-1">
                        <icon-lucide-map-pin class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {{ order.venueAddressSnapshot }}
                      </p>
                    </div>
                    <div v-if="order.ticketTypeNameSnapshot">
                      <p class="text-sm text-muted-foreground">票种</p>
                      <p class="font-medium text-foreground">{{ order.ticketTypeNameSnapshot }}</p>
                    </div>
                    <div v-if="order.unitPrice !== undefined">
                      <p class="text-sm text-muted-foreground">单价</p>
                      <p class="font-medium text-foreground">{{ formatPrice(order.unitPrice) }}</p>
                    </div>
                    <div v-if="order.quantity !== undefined">
                      <p class="text-sm text-muted-foreground">数量</p>
                      <p class="font-medium text-foreground">{{ order.quantity }} 张</p>
                    </div>
                    <div v-if="order.totalAmount !== undefined">
                      <p class="text-sm text-muted-foreground">订单金额</p>
                      <p class="font-medium text-primary text-lg">
                        {{ formatPrice(order.totalAmount) }}
                      </p>
                    </div>
                  </div>

                  <div class="border-t border-border pt-4 space-y-4">
                    <div>
                      <p class="text-sm text-muted-foreground">创建时间</p>
                      <p class="font-medium text-foreground">
                        {{ formatDateTime(order.createAt) }}
                      </p>
                    </div>
                    <div v-if="order.payTime">
                      <p class="text-sm text-muted-foreground">支付时间</p>
                      <p class="font-medium text-foreground">{{ formatDateTime(order.payTime) }}</p>
                    </div>
                    <div v-if="order.cancelTime">
                      <p class="text-sm text-muted-foreground">取消时间</p>
                      <p class="font-medium text-foreground">
                        {{ formatDateTime(order.cancelTime) }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div v-if="order.status === 0" class="flex justify-center">
              <Button size="lg" @click="goToPayment">
                <icon-lucide-credit-card class="h-4 w-4 mr-2" />
                立即支付
              </Button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
