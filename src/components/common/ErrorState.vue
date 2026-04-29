<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    title: '加载失败',
    description: '请稍后重试',
    class: '',
  },
)
</script>

<template>
  <div
    :class="
      cn(
        'flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-8 text-center',
        props.class,
      )
    "
  >
    <div
      class="flex size-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive"
    >
      <icon-lucide-alert-circle class="size-6" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-medium text-destructive">{{ title }}</p>
      <p v-if="description" class="text-sm leading-6 text-muted-foreground">{{ description }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
