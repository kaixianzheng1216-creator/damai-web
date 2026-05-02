<script setup lang="ts">
import CardListItem from '@/components/common/CardListItem.vue'
import { formatPrice, formatDateTime } from '@/utils/format'

const props = defineProps<{
  id: string
  eventNameSnapshot: string
  eventCoverUrlSnapshot?: string
  venueNameSnapshot?: string
  sessionStartAtSnapshot?: string
  totalAmount?: number
  quantity?: number
  amount?: string
  statusLabel: string
  orderNo: string
  to?: string
}>()

const linkTarget = computed(() => props.to || `/checkout/${props.id}`)
</script>

<template>
  <CardListItem :to="linkTarget">
    <template #cover>
      <img
        v-if="eventCoverUrlSnapshot"
        :src="eventCoverUrlSnapshot"
        :alt="eventNameSnapshot"
        class="aspect-[3/4] h-auto w-24 rounded-lg object-cover"
      />
      <div
        v-else
        class="flex aspect-[3/4] h-auto w-24 items-center justify-center rounded-lg bg-muted"
      >
        <icon-lucide-ticket class="h-8 w-8 text-muted-foreground" />
      </div>
    </template>
    <template #title>
      <p class="line-clamp-2 text-sm font-bold text-foreground">{{ eventNameSnapshot }}</p>
    </template>
    <template #details>
      <p v-if="venueNameSnapshot" class="flex items-center gap-1 text-xs text-muted-foreground">
        <icon-lucide-map-pin class="h-3 w-3" />{{ venueNameSnapshot }}
      </p>
      <p
        v-if="sessionStartAtSnapshot"
        class="flex items-center gap-1 text-xs text-muted-foreground"
      >
        <icon-lucide-calendar class="h-3 w-3" />{{ formatDateTime(sessionStartAtSnapshot) }}
      </p>
    </template>
    <template #middle>
      <div v-if="totalAmount != null" class="space-y-2 pt-1">
        <p class="text-sm font-medium text-foreground">
          {{ formatPrice(totalAmount) }}
        </p>
        <hr class="border-border" />
      </div>
      <div v-else-if="amount" class="space-y-2 pt-1">
        <p class="text-lg font-bold text-primary">{{ amount }}</p>
        <hr class="border-border" />
      </div>
    </template>
    <template #bottomLeft>
      <p class="text-xs text-muted-foreground">{{ orderNo }}</p>
    </template>
    <template #topRight>
      <span
        class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
      >
        {{ statusLabel }}
      </span>
    </template>
  </CardListItem>
</template>
