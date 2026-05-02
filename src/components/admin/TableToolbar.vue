<script setup lang="ts">
import { Button } from '@/components/common/ui/button'

interface Props {
  title?: string
  showCreateButton?: boolean
}

withDefaults(defineProps<Props>(), {
  showCreateButton: true,
})

const emit = defineEmits<{
  create: []
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 min-w-0">
    <h2 v-if="title" class="shrink-0 text-lg font-semibold text-foreground">
      {{ title }}
    </h2>
    <slot name="toolbar" />
    <div class="hidden sm:block flex-1" />
    <div class="ml-auto shrink-0">
      <slot name="actions">
        <Button v-if="showCreateButton" size="sm" @click="emit('create')">
          <icon-lucide-plus class="mr-1.5 h-4 w-4" />
          新建
        </Button>
      </slot>
    </div>
  </div>
</template>
