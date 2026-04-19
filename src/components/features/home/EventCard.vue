<script setup lang="ts">
import type { HomeEventCardItem } from '@/api/event'

defineProps<{
  event: HomeEventCardItem
}>()

const formatPriceText = (priceText: string) => priceText.replace(/\s*元$/, '\u00A0元')
</script>

<template>
  <RouterLink :to="`/detail/${event.id}`" class="group flex h-full min-w-0 cursor-pointer flex-col">
    <div class="relative mb-2 aspect-[3/4] flex-shrink-0 overflow-hidden rounded-lg md:mb-3">
      <img
        :src="event.coverImageUrl"
        :alt="event.seriesName"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>

    <div class="min-w-0 flex-1 px-0.5">
      <h3
        class="mb-1.5 line-clamp-2 min-h-[2.5em] text-sm font-bold leading-snug transition-colors group-hover:text-primary md:mb-2 md:min-h-[3em] md:text-base"
      >
        {{ event.seriesName }}
      </h3>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1 truncate text-sm text-muted-foreground">
          <icon-lucide-map-pin class="h-3 w-3 shrink-0" />
          <span class="truncate">{{ event.venueName }}</span>
        </div>
        <div class="flex items-center gap-1 truncate text-sm text-muted-foreground">
          <icon-lucide-calendar class="h-3 w-3 shrink-0" />
          <span class="truncate">{{ event.dateText }}</span>
        </div>
      </div>
      <div
        class="mt-auto whitespace-nowrap pt-2 text-base font-bold leading-none text-primary md:pt-4 md:text-xl"
      >
        {{ formatPriceText(event.priceText) }}
      </div>
    </div>
  </RouterLink>
</template>
