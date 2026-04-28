<script setup lang="ts">
import type { AiChatItem } from '@/api/ai/types'
import { AI_CHAT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import { formatPrice } from '@/utils/format'

defineProps<{
  item: AiChatItem
}>()
</script>

<template>
  <RouterLink :to="`/detail/${item.id}`" class="flex gap-3 rounded-xl bg-card p-3 hover:shadow-md">
    <img
      :src="item.coverUrl"
      :alt="item.name"
      class="aspect-[3/4] h-auto w-20 shrink-0 rounded-lg object-cover"
    />
    <div class="flex flex-1 flex-col justify-between py-0.5">
      <div class="space-y-1">
        <p class="line-clamp-2 text-sm font-bold text-foreground">{{ item.name }}</p>
        <div class="space-y-0.5">
          <p class="flex items-center gap-1 text-xs text-muted-foreground">
            <icon-lucide-map-pin class="h-3 w-3" />
            {{ item.venueName }}
          </p>
          <p class="flex items-center gap-1 text-xs text-muted-foreground">
            <icon-lucide-calendar class="h-3 w-3" />
            {{ item.startTime }}
          </p>
        </div>
      </div>
      <div class="flex items-end justify-between">
        <p class="text-lg font-bold text-primary">{{ formatPrice(item.minPrice) }}</p>
        <Button size="sm" class="h-auto rounded px-3 py-1 text-xs">
          {{ AI_CHAT_COPY.buyTicket }}
        </Button>
      </div>
    </div>
  </RouterLink>
</template>
