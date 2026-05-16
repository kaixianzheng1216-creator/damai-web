<script setup lang="ts">
import { AI_CHAT_COPY } from '@/constants'
import CardListItem from '@/components/common/CardListItem.vue'
import { Button } from '@/components/common/ui/button'
import { formatDateTime } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    id: string
    eventNameSnapshot: string
    eventCoverUrlSnapshot?: string
    venueNameSnapshot?: string
    sessionStartAtSnapshot?: string
    passengerNameSnapshot?: string
    status?: number
    statusLabel: string
    ticketNo: string
    to?: string
    showButton?: boolean
  }>(),
  {
    showButton: false,
  },
)

const linkTarget = computed(() => props.to || `/ticket/${props.id}`)
</script>

<template>
  <CardListItem :to="linkTarget">
    <template #cover>
      <img
        :src="eventCoverUrlSnapshot || ''"
        alt="电子票封面"
        class="aspect-[3/4] h-auto w-20 rounded-lg object-cover sm:w-24"
      />
    </template>
    <template #title>
      <p class="line-clamp-2 text-sm font-bold text-foreground">{{ eventNameSnapshot }}</p>
    </template>
    <template #details>
      <p
        v-if="venueNameSnapshot"
        class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
      >
        <icon-lucide-map-pin class="h-3 w-3 shrink-0" />
        <span class="truncate">{{ venueNameSnapshot }}</span>
      </p>
      <p class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
        <icon-lucide-calendar class="h-3 w-3 shrink-0" />
        <span class="truncate">{{ formatDateTime(sessionStartAtSnapshot) }}</span>
      </p>
    </template>
    <template #middle>
      <div v-if="passengerNameSnapshot" class="space-y-2 pt-1">
        <p class="text-sm text-foreground">购票人：{{ passengerNameSnapshot }}</p>
        <hr class="border-border" />
      </div>
    </template>
    <template #bottomLeft>
      <p class="truncate text-xs text-muted-foreground">{{ ticketNo }}</p>
    </template>
    <template #topRight>
      <Badge>{{ statusLabel }}</Badge>
    </template>
    <template #bottomRight>
      <Button v-if="showButton" size="sm" class="h-auto rounded px-3 py-1 text-xs">
        {{ AI_CHAT_COPY.viewTicket }}
      </Button>
    </template>
  </CardListItem>
</template>
