<script setup lang="ts">
import { formatPrice, formatDateTime } from '@/utils/format'
import type { EventDetailVO, TicketTypeVO, SeriesEventVO } from '@/api/event'
import { TICKET_TYPE_STATUS } from '@/constants'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/common/ui/number-field'

defineProps<{
  detail: EventDetailVO
  selectedSessionId: string | null
  selectedTicketTypeId: string | null
  ticketQuantity: number
  selectedTicketTypeLimit: number
  maxTicketQuantity: number
  totalPrice: string
  isCreatingOrder: boolean
  availableTicketTypes: TicketTypeVO[]
  selectedTicketType?: TicketTypeVO
  seriesEvents: SeriesEventVO[]
}>()

const emit = defineEmits<{
  'switch-event': [id: string]
  'update:selectedSessionId': [value: string | null]
  'update:selectedTicketTypeId': [value: string | null]
  'update:ticketQuantity': [value: number]
  'buy-now': []
}>()
</script>

<template>
  <div
    class="grid gap-6 border-b border-border p-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 md:p-6"
  >
    <div class="aspect-[3/4] w-[220px] flex-shrink-0 overflow-hidden rounded-sm">
      <img
        :src="detail.event.coverUrl"
        :alt="detail.event.name"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="min-w-0">
      <h1 class="text-xl font-medium leading-tight text-foreground xl:text-[28px]">
        {{ detail.event.name }}
      </h1>

      <div class="mt-5 space-y-3">
        <p class="text-sm text-foreground">
          时间：{{ detail.event.firstSessionStartAt ? formatDateTime(detail.event.firstSessionStartAt) : '' }}
        </p>
        <p class="text-sm text-foreground">
          场馆：{{ detail.event.cityNameSnapshot }} | {{ detail.event.venueNameSnapshot }}
        </p>
      </div>

      <div class="mt-6 space-y-5">
        <div v-if="seriesEvents.length > 0">
          <p class="text-sm text-muted-foreground">同系列活动</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="event in seriesEvents"
              :key="event.id"
              type="button"
              :class="
                cn(
                  'rounded-sm border px-3 py-1 text-sm transition-colors',
                  event.id === detail.event.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:border-primary/40 hover:text-primary',
                )
              "
              @click="emit('switch-event', event.id)"
            >
              {{ event.name }}
            </button>
          </div>
        </div>

        <div>
          <p class="text-sm text-muted-foreground">场次</p>
          <div class="mt-2 flex max-w-[760px] flex-wrap gap-2">
            <button
              v-for="session in detail.sessions"
              :key="session.id"
              type="button"
              :class="
                cn(
                  'rounded-sm border px-3 py-1 text-sm transition-colors',
                  session.id === selectedSessionId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:border-primary/40 hover:text-primary',
                )
              "
              @click="emit('update:selectedSessionId', session.id)"
            >
              {{ session.name }}
            </button>
          </div>
        </div>

        <div>
          <p class="text-sm text-muted-foreground">票档</p>
          <div class="mt-2 flex max-w-[760px] flex-wrap gap-2">
            <button
              v-for="ticketType in availableTicketTypes"
              :key="ticketType.id"
              type="button"
              :disabled="ticketType.status !== TICKET_TYPE_STATUS.ON_SALE"
              :class="
                cn(
                  'rounded-sm border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  ticketType.id === selectedTicketTypeId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:border-primary/40 hover:text-primary',
                )
              "
              @click="emit('update:selectedTicketTypeId', ticketType.id)"
            >
              {{ ticketType.name }} ({{ formatPrice(ticketType.price) }})
              <span v-if="ticketType.status !== TICKET_TYPE_STATUS.ON_SALE" class="ml-1">不可售</span>
            </button>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            当前票档单笔限购 {{ selectedTicketTypeLimit }} 张。
          </p>
        </div>

        <div>
          <p class="text-sm text-muted-foreground">数量</p>
          <NumberField
            class="w-40"
            :model-value="ticketQuantity"
            :min="1"
            :max="maxTicketQuantity"
            @update:model-value="(val) => val !== undefined && emit('update:ticketQuantity', val)"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
          <p class="mt-2 text-sm text-muted-foreground">
            数量上限会随票档限购与可用购票人数自动调整。
          </p>
        </div>

        <div class="rounded-xl border border-border bg-muted/20 p-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">当前合计</p>
              <p class="mt-1 text-2xl font-semibold text-primary">{{ totalPrice }}</p>
            </div>
            <div class="text-right text-sm text-muted-foreground">
              <p>票档：{{ selectedTicketType?.name || '--' }}</p>
              <p class="mt-1">
                单价：{{ formatPrice(selectedTicketType?.price || 0) }} × {{ ticketQuantity }}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <Button
            class="w-full md:min-w-[124px] md:w-auto"
            :disabled="isCreatingOrder || !selectedTicketType"
            @click="emit('buy-now')"
          >
            <icon-lucide-loader2 v-if="isCreatingOrder" class="mr-2 h-4 w-4 animate-spin" />
            立即购票
          </Button>
          <p class="mt-2 text-sm text-muted-foreground">
            下单前需先选择实名购票人，可为不同票张分别绑定。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
