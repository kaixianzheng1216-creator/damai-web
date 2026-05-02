<script setup lang="ts">
import { Card } from '@/components/common/ui/card'

defineProps<{
  /** RouterLink target. If undefined, renders a plain card */
  to?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <RouterLink v-if="to" :to="to" class="outline-none" @click.stop>
    <Card class="flex-row gap-5 p-5 cursor-pointer hover:shadow-md">
      <div class="shrink-0">
        <slot name="cover" />
      </div>
      <div class="flex flex-1 flex-col justify-between py-1">
        <div class="space-y-1">
          <slot name="title" />
          <div class="space-y-0.5">
            <slot name="details" />
          </div>
        </div>
        <slot name="middle" />
        <div class="flex items-end justify-between">
          <slot name="bottomLeft"><div /></slot>
          <slot name="bottomRight" />
        </div>
      </div>
    </Card>
  </RouterLink>
  <Card v-else class="flex-row gap-5 p-5 cursor-pointer hover:shadow-md" @click="$emit('click')">
    <div class="shrink-0">
      <slot name="cover" />
    </div>
    <div class="flex flex-1 flex-col justify-between py-1">
      <div class="space-y-1">
        <slot name="title" />
        <div class="space-y-0.5">
          <slot name="details" />
        </div>
      </div>
      <slot name="middle" />
      <div class="flex items-end justify-between">
        <slot name="bottomLeft"><div /></slot>
        <slot name="bottomRight" />
      </div>
    </div>
  </Card>
</template>
