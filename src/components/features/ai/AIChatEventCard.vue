<script setup lang="ts">
import type { AiChatEventItem } from '@/api/ai/types'
import { AI_CHAT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import { formatPriceRange, formatDateTimeRange } from '@/utils/format'

const props = defineProps<{
  item: AiChatEventItem
}>()

const linkTarget = computed(() => `/detail/${props.item.id}`)
</script>

<template>
  <RouterLink :to="linkTarget" class="flex gap-5 rounded-xl bg-card p-5 hover:shadow-md">
    <div class="shrink-0">
      <img
        :src="item.coverUrl || ''"
        :alt="item.name"
        class="aspect-[3/4] h-auto w-24 rounded-lg object-cover"
      />
    </div>
    <div class="flex flex-1 flex-col justify-between py-1">
      <div class="space-y-1">
        <p class="line-clamp-2 text-sm font-bold text-foreground">{{ item.name }}</p>
        <div class="space-y-0.5">
          <p v-if="item.participantName" class="text-xs text-muted-foreground">
            {{ item.participantName }}
          </p>
          <p class="flex items-center gap-1 text-xs text-muted-foreground">
            <icon-lucide-map-pin class="h-3 w-3" />
            {{ item.cityNameSnapshot
            }}<template v-if="item.cityNameSnapshot && item.venueNameSnapshot"> | </template
            >{{ item.venueNameSnapshot }}
          </p>
          <p class="flex items-center gap-1 text-xs text-muted-foreground">
            <icon-lucide-calendar class="h-3 w-3" />
            {{ formatDateTimeRange(item.firstSessionStartAt, item.lastSessionEndAt) }}
          </p>
        </div>
      </div>
      <div class="flex items-end justify-between">
        <p class="text-lg font-bold text-primary">
          {{ formatPriceRange(item.minPrice, item.maxPrice) }}
        </p>
        <Button size="sm" class="h-auto rounded px-3 py-1 text-xs">
          {{ AI_CHAT_COPY.buyTicket }}
        </Button>
      </div>
    </div>
  </RouterLink>
</template>
