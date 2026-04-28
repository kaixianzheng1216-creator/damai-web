<script setup lang="ts">
import type { Component } from 'vue'
import {
  Baby,
  Clapperboard,
  Compass,
  Gamepad2,
  HelpCircle,
  Landmark,
  Mic,
  Music,
  PersonStanding,
  Piano,
  Ticket,
  Trophy,
} from 'lucide-vue-next'
import type { HomeCategoryItem } from '@/api/event'

defineProps<{
  categories: HomeCategoryItem[]
}>()

const categoryIcons: Record<string, Component> = {
  Baby,
  Clapperboard,
  Compass,
  Gamepad2,
  HelpCircle,
  Landmark,
  Mic,
  Music,
  PersonStanding,
  Piano,
  Ticket,
  Trophy,
}

const getIcon = (name: string) => {
  return categoryIcons[name] ?? HelpCircle
}
</script>

<template>
  <div class="rounded-xl border border-border/50 bg-background px-2 py-3 shadow-sm md:p-6">
    <div
      class="flex gap-1 overflow-x-auto scrollbar-hide md:grid md:grid-cols-10 md:gap-6 md:overflow-visible"
    >
      <RouterLink
        v-for="category in categories"
        :key="category.id"
        :to="category.linkUrl"
        class="group flex shrink-0 cursor-pointer flex-col items-center justify-center gap-1 px-2 md:gap-2 md:px-0"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-muted/30 text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground md:h-12 md:w-12"
        >
          <component :is="getIcon(category.icon)" class="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <span
          class="whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary md:text-sm"
        >
          {{ category.name }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>
