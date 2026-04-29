<script setup lang="ts">
import { formatDateTime } from '@/utils/format'
import { getTicketStatusClass } from '@/utils/statusMappers'
import { Badge } from '@/components/common/ui/badge'
import ErrorState from '@/components/common/ErrorState.vue'
import { useTicketDetailPage } from '@/composables/ticket'

const { ticket, isLoading, isError, isEmpty, goBack } = useTicketDetailPage()
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

        <ErrorState
          v-else-if="isError || isEmpty"
          class="section-card min-h-64"
          :title="isEmpty ? '电子票不存在或链接已失效' : '电子票加载失败'"
          :description="isEmpty ? '请确认链接是否正确，或返回上一页重新进入。' : '请稍后重试。'"
        >
          <template #action>
            <Button variant="outline" @click="goBack">返回</Button>
          </template>
        </ErrorState>

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
              <div class="section-card bg-white">
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
                  <p class="font-medium text-foreground flex items-center gap-1">
                    <icon-lucide-calendar class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {{ formatDateTime(ticket.sessionStartAtSnapshot) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">场馆</p>
                  <p class="font-medium text-foreground flex items-center gap-1">
                    <icon-lucide-building-2 class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {{ ticket.venueNameSnapshot }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">场馆地址</p>
                  <p class="font-medium text-foreground flex items-center gap-1">
                    <icon-lucide-map-pin class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {{ ticket.venueAddressSnapshot }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">购票人</p>
                  <p class="font-medium text-foreground flex items-center gap-1">
                    <icon-lucide-user class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {{ ticket.passengerNameSnapshot }}
                  </p>
                </div>
              </div>

              <div class="border-t border-border pt-4">
                <p class="text-sm text-muted-foreground">订单号</p>
                <p class="font-medium text-foreground">{{ ticket.orderNo }}</p>
              </div>

              <div class="border-t border-border pt-4">
                <p class="text-sm text-muted-foreground">Token</p>
                <p class="font-medium text-foreground break-all">
                  {{ ticket.qrCodeToken }}
                </p>
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
