<script setup lang="ts">
import type { AiChatTicketItem } from '@/api/ai/types'
import { AI_CHAT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{
  item: AiChatTicketItem
}>()

const linkTarget = computed(() => `/ticket/${props.item.id}`)
</script>

<template>
  <RouterLink :to="linkTarget" class="flex gap-3 rounded-xl bg-card p-3 hover:shadow-md">
    <img
      :src="item.eventCoverUrlSnapshot || ''"
      :alt="item.eventNameSnapshot"
      class="aspect-[3/4] h-auto w-20 shrink-0 rounded-lg object-cover"
    />
    <div class="flex flex-1 flex-col justify-between py-0.5">
      <div class="space-y-1">
        <p class="line-clamp-2 text-sm font-bold text-foreground">{{ item.eventNameSnapshot }}</p>
        <div class="space-y-0.5">
          <p class="flex items-center gap-1 text-xs text-muted-foreground">
            <icon-lucide-map-pin class="h-3 w-3" />
            {{ item.venueNameSnapshot }}
          </p>
          <p class="flex items-center gap-1 text-xs text-muted-foreground">
            <icon-lucide-calendar class="h-3 w-3" />
            {{ formatDateTime(item.sessionStartAtSnapshot) }}
          </p>
        </div>
      </div>
      <div class="space-y-2">
        <p v-if="item.passengerNameSnapshot" class="text-sm text-foreground">
          {{ AI_CHAT_COPY.passenger }}：{{ item.passengerNameSnapshot }}
        </p>
        <div class="border-t border-border pt-2">
          <div class="flex items-center justify-between">
            <p class="text-xs font-mono text-muted-foreground">{{ item.ticketNo }}</p>
            <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {{ item.statusLabel }}
            </span>
          </div>
        </div>
        <div class="flex items-end justify-between">
          <div />
          <Button size="sm" class="h-auto rounded px-3 py-1 text-xs">
            {{ AI_CHAT_COPY.viewTicket }}
          </Button>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
