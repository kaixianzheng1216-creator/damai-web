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
    title: '暂无数据',
    description: '',
    class: '',
  },
)
</script>

<template>
  <div
    :class="
      cn(
        'flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-8 text-center text-muted-foreground',
        props.class,
      )
    "
  >
    <div
      class="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/30"
    >
      <icon-lucide-inbox class="size-6 opacity-60" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-medium text-foreground">{{ title }}</p>
      <p v-if="description" class="text-sm leading-6">{{ description }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
