<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchTicketById } from '@/api/ticket'
import { formatDateTime } from '@/utils/format'
import { getTicketStatusClass } from '@/utils/statusMappers'
import { Badge } from '@/components/common/ui/badge'

const route = useRoute()
const router = useRouter()

const ticketId = computed(() => route.params.id as string)

const {
  data: ticket,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['ticket-detail', ticketId],
  queryFn: () => fetchTicketById(ticketId.value),
  enabled: computed(() => !!ticketId.value),
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="bg-background min-h-screen py-6">
    <div class="container mx-auto px-4 md:px-6">
      <div class="max-w-2xl mx-auto">
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
          <p class="text-destructive">电子票加载失败，请稍后重试</p>
          <Button variant="outline" @click="goBack" class="mt-4"> 返回 </Button>
        </div>

        <template v-else-if="ticket">
          <div class="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-foreground">
                  {{ ticket.eventNameSnapshot }}
                </h1>
                <p class="mt-1 text-sm text-muted-foreground">电子票号：{{ ticket.ticketNo }}</p>
              </div>
              <Badge :class="getTicketStatusClass(ticket.status)">{{ ticket.statusLabel }}</Badge>
            </div>

            <div v-if="ticket.qrCodeBase64" class="mb-6 flex justify-center">
              <div class="rounded-xl border border-border p-6 bg-white">
                <img :src="ticket.qrCodeBase64" alt="电子票二维码" class="w-48 h-48" />
              </div>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground">活动名称</p>
                  <p class="font-medium text-foreground">{{ ticket.eventNameSnapshot }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">票种</p>
                  <p class="font-medium text-foreground">{{ ticket.ticketTypeNameSnapshot }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">场次</p>
                  <p class="font-medium text-foreground">
                    {{ formatDateTime(ticket.sessionStartAtSnapshot) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">场馆</p>
                  <p class="font-medium text-foreground">{{ ticket.venueNameSnapshot }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">场馆地址</p>
                  <p class="font-medium text-foreground">{{ ticket.venueAddressSnapshot }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">购票人</p>
                  <p class="font-medium text-foreground">{{ ticket.passengerNameSnapshot }}</p>
                </div>
              </div>

              <div class="border-t border-border pt-4">
                <p class="text-sm text-muted-foreground">订单号</p>
                <p class="font-medium text-foreground">{{ ticket.orderNo }}</p>
              </div>

              <div v-if="ticket.usedAt">
                <p class="text-sm text-muted-foreground">使用时间</p>
                <p class="font-medium text-foreground">{{ formatDateTime(ticket.usedAt) }}</p>
              </div>

              <div>
                <p class="text-sm text-muted-foreground">创建时间</p>
                <p class="font-medium text-foreground">{{ formatDateTime(ticket.createAt) }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
