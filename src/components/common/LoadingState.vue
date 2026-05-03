<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'

const SIZES = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
} as const

const props = withDefaults(
  defineProps<{
    minHeight?: string
    message?: string
    size?: 'sm' | 'md' | 'lg'
    class?: HTMLAttributes['class']
  }>(),
  {
    minHeight: '400px',
    message: '',
    size: 'md',
    class: '',
  },
)
</script>

<template>
  <div
    :class="
      cn('flex', message ? 'flex-col space-y-4' : 'flex-center', 'animate-in fade-in', props.class)
    "
    :style="{ minHeight: props.minHeight }"
  >
    <icon-lucide-loader2 :class="[SIZES[props.size], 'animate-spin text-primary']" />
    <p v-if="props.message" class="animate-pulse text-muted-foreground">{{ props.message }}</p>
  </div>
</template>
