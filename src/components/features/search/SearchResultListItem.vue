<script setup lang="ts">
import { formatPrice, formatDateTime } from '@/utils/format'
import type { EventVO } from '@/api/event'

defineProps<{
  item: EventVO
}>()
</script>

<template>
  <RouterLink
    :to="`/detail/${item.id}`"
    class="flex gap-4 border-b border-border py-6 transition-colors hover:bg-muted/20"
  >
    <div class="aspect-[3/4] w-36 flex-shrink-0 overflow-hidden rounded-sm">
      <img :src="item.coverUrl" :alt="item.name" class="h-full w-full object-cover" />
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="line-clamp-2 text-lg font-medium leading-snug text-foreground hover:text-primary">
        {{ item.name }}
      </h3>
      <p class="mt-2 text-sm text-muted-foreground">{{ item.categoryNameSnapshot }}</p>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ item.cityNameSnapshot }} | {{ item.venueNameSnapshot }}
      </p>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ item.firstSessionStartAt ? formatDateTime(item.firstSessionStartAt) : '' }}
      </p>
      <div class="mt-12 flex items-center gap-4">
        <span class="text-2xl font-semibold text-primary">{{ item.minPrice != null ? formatPrice(item.minPrice) : '' }} 起</span>
        <span class="text-sm text-muted-foreground">{{ item.statusLabel }}</span>
      </div>
    </div>
  </RouterLink>
</template>
