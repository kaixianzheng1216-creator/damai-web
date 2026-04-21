<script setup lang="ts">
import { formatPrice, formatDateTime } from '@/utils/format'
import type { EventVO } from '@/api/event'

defineProps<{
  item: EventVO
}>()
</script>

<template>
  <div class="flex gap-4 border-b border-border py-6 transition-colors hover:bg-muted/20">
    <RouterLink
      :to="`/detail/${item.id}`"
      class="aspect-[3/4] w-36 flex-shrink-0 overflow-hidden rounded-sm"
    >
      <img
        :src="item.coverUrl"
        :alt="item.name"
        loading="lazy"
        class="h-full w-full object-cover"
      />
    </RouterLink>

    <div class="min-w-0 flex-1 flex flex-col justify-between">
      <div class="space-y-2">
        <RouterLink :to="`/detail/${item.id}`" class="block">
          <h3
            class="line-clamp-2 text-lg font-medium leading-snug text-foreground hover:text-primary"
          >
            {{ item.name }}
          </h3>
        </RouterLink>
        <div
          v-if="item.participants && item.participants.length > 0"
          class="flex items-center gap-1"
        >
          <icon-lucide-users class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div class="flex items-center gap-1">
            <template v-for="(participant, index) in item.participants" :key="participant.id">
              <RouterLink
                v-if="participant.participant"
                :to="`/participant/${participant.participant.id}`"
                class="text-sm text-muted-foreground hover:text-primary"
                @click.stop
              >
                {{ participant.participant.name }}
              </RouterLink>
              <span v-if="index < item.participants.length - 1" class="text-muted-foreground"
                >、</span
              >
            </template>
          </div>
        </div>
        <p class="flex items-center gap-1 text-sm text-muted-foreground">
          <icon-lucide-map-pin class="h-3.5 w-3.5 shrink-0" />
          {{ item.cityNameSnapshot }} | {{ item.venueNameSnapshot }}
        </p>
        <p class="flex items-center gap-1 text-sm text-muted-foreground">
          <icon-lucide-calendar class="h-3.5 w-3.5 shrink-0" />
          <span
            v-if="
              item.firstSessionStartAt &&
              item.lastSessionEndAt &&
              item.firstSessionStartAt !== item.lastSessionEndAt
            "
          >
            {{ formatDateTime(item.firstSessionStartAt) }} —
            {{ formatDateTime(item.lastSessionEndAt) }}
          </span>
          <span v-else-if="item.firstSessionStartAt">
            {{ formatDateTime(item.firstSessionStartAt) }}
          </span>
        </p>
      </div>
      <div class="pt-2">
        <RouterLink :to="`/detail/${item.id}`" class="inline-block">
          <span
            v-if="item.minPrice != null && item.maxPrice != null && item.minPrice !== item.maxPrice"
            class="text-2xl font-semibold text-primary"
          >
            {{ formatPrice(item.minPrice) }} — {{ formatPrice(item.maxPrice) }}
          </span>
          <span v-else-if="item.minPrice != null" class="text-2xl font-semibold text-primary">
            {{ formatPrice(item.minPrice) }} 起
          </span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
