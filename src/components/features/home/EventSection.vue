<script setup lang="ts">
import type { HomeEventCardItem } from '@/api/event'

defineProps<{
  title: string
  linkUrl: string
  events: HomeEventCardItem[]
}>()
</script>

<template>
  <section class="py-3 md:py-6">
    <div class="mb-4 flex items-center justify-between md:mb-6">
      <h2 class="text-xl font-bold text-foreground md:text-2xl">{{ title }}</h2>
      <RouterLink
        :to="linkUrl"
        class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        查看全部
        <icon-lucide-chevron-right class="ml-1 h-4 w-4" />
      </RouterLink>
    </div>

    <div class="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
      <EventCard v-for="event in events" :key="event.id" :event="event" />
    </div>
  </section>
</template>
