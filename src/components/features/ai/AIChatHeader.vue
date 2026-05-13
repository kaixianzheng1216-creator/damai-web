<script setup lang="ts">
import { AI_CHAT_COPY } from '@/constants'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: AI_CHAT_COPY.title,
    subtitle: AI_CHAT_COPY.subtitle,
  },
)
</script>

<template>
  <div class="z-10 border-b border-border bg-background">
    <div class="mx-auto flex w-full max-w-[800px] items-center justify-between px-4 py-3 md:px-6">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <icon-lucide-sparkles class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold leading-tight">{{ title }}</h1>
            <p class="text-xs text-muted-foreground">{{ subtitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
