<script setup lang="ts">
import { formatPrice, formatDateTime } from '@/utils/format'
import type { EventDetailVO, TicketTypeVO, SeriesEventVO } from '@/api/event'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/common/ui/number-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/ui/avatar'
import { Button } from '@/components/common/ui/button'

defineProps<{
  detail: EventDetailVO
  selectedSessionId: string | null
  selectedTicketTypeId: string | null
  ticketQuantity: number
  selectedTicketTypeLimit: number
  selectedTicketTypeAccountLimit: number
  isSelectedTicketTypeOnSale: boolean
  isTicketTypeOnSale: (ticketType: TicketTypeVO) => boolean
  isUserAccountLimitReached: boolean
  maxTicketQuantity: number
  totalPrice: string
  isCreatingOrder: boolean
  availableTicketTypes: TicketTypeVO[]
  selectedTicketType?: TicketTypeVO
  seriesEvents: SeriesEventVO[]
  isFollowed?: boolean
  isFollowLoading?: boolean
}>()

const emit = defineEmits<{
  'switch-event': [id: string]
  'update:selectedSessionId': [value: string | null]
  'update:selectedTicketTypeId': [value: string | null]
  'update:ticketQuantity': [value: number]
  'buy-now': []
  'toggle-follow': []
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
        loading="lazy"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="min-w-0">
      <div class="flex items-start justify-between gap-4">
        <h1 class="flex-1 text-xl font-medium leading-tight text-foreground xl:text-[28px]">
          {{ detail.event.name }}
        </h1>
        <Button
          :variant="isFollowed ? 'default' : 'outline'"
          size="sm"
          :disabled="isFollowLoading"
          @click="emit('toggle-follow')"
        >
          <icon-lucide-heart v-if="isFollowed" class="mr-1 h-4 w-4 fill-current" />
          <icon-lucide-heart v-else class="mr-1 h-4 w-4" />
          {{ isFollowed ? '已关注' : '关注' }}
        </Button>
      </div>

      <div class="mt-5 space-y-3">
        <p class="flex items-center gap-1.5 text-sm text-foreground">
          <icon-lucide-calendar class="h-4 w-4 shrink-0 text-muted-foreground" />
          {{
            detail.event.firstSessionStartAt ? formatDateTime(detail.event.firstSessionStartAt) : ''
          }}
        </p>
        <p class="flex items-center gap-1.5 text-sm text-foreground">
          <icon-lucide-map-pin class="h-4 w-4 shrink-0 text-muted-foreground" />
          {{ detail.event.cityNameSnapshot }} | {{ detail.event.venueNameSnapshot }}
        </p>
        <div
          v-if="detail.participants && detail.participants.length > 0"
          class="flex items-center gap-2"
        >
          <icon-lucide-users class="h-4 w-4 shrink-0 text-muted-foreground" />
          <div class="flex items-center gap-3">
            <RouterLink
              v-for="participant in detail.participants"
              :key="participant.id"
              :to="`/participant/${participant.participant.id}`"
              class="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Avatar class="h-7 w-7">
                <AvatarImage
                  :src="participant.participant.avatarUrl"
                  :alt="participant.participant.name"
                />
                <AvatarFallback>{{ participant.participant.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <span class="text-sm text-foreground">{{ participant.participant.name }}</span>
            </RouterLink>
          </div>
        </div>
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
              :disabled="!isTicketTypeOnSale(ticketType)"
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
              <span v-if="!isTicketTypeOnSale(ticketType)" class="ml-1">不可售</span>
            </button>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            当前票档单笔限购 {{ selectedTicketTypeLimit }} 张
            <span v-if="selectedTicketTypeAccountLimit > 0">
              ，单用户限购 {{ selectedTicketTypeAccountLimit }} 张
            </span>
            。
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
        </div>

        <div class="section-card-muted">
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
            :disabled="
              isCreatingOrder ||
              !selectedTicketType ||
              !isSelectedTicketTypeOnSale ||
              isUserAccountLimitReached
            "
            @click="emit('buy-now')"
          >
            <icon-lucide-loader2 v-if="isCreatingOrder" class="mr-2 h-4 w-4 animate-spin" />
            {{ isUserAccountLimitReached ? '已达限购上限' : '立即购票' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
