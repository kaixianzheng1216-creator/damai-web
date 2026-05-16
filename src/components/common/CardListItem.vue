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
  <RouterLink v-if="to" :to="to" class="block min-w-0 outline-none" @click.stop>
    <Card class="cursor-pointer flex-row gap-3 p-3 hover:shadow-md sm:gap-5 sm:p-5">
      <div class="shrink-0">
        <slot name="cover" />
      </div>
      <div class="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div class="space-y-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <slot name="title" />
            </div>
            <div class="shrink-0">
              <slot name="topRight"><div /></slot>
            </div>
          </div>
          <div class="min-w-0 space-y-0.5">
            <slot name="details" />
          </div>
        </div>
        <div class="min-w-0">
          <slot name="middle" />
        </div>
        <div class="flex min-w-0 items-end justify-between gap-2">
          <div class="min-w-0">
            <slot name="bottomLeft"><div /></slot>
          </div>
          <div class="shrink-0">
            <slot name="bottomRight" />
          </div>
        </div>
      </div>
    </Card>
  </RouterLink>
  <Card
    v-else
    class="cursor-pointer flex-row gap-3 p-3 hover:shadow-md sm:gap-5 sm:p-5"
    @click="$emit('click')"
  >
    <div class="shrink-0">
      <slot name="cover" />
    </div>
    <div class="flex min-w-0 flex-1 flex-col justify-between py-1">
      <div class="space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <slot name="title" />
          </div>
          <div class="shrink-0">
            <slot name="topRight"><div /></slot>
          </div>
        </div>
        <div class="min-w-0 space-y-0.5">
          <slot name="details" />
        </div>
      </div>
      <div class="min-w-0">
        <slot name="middle" />
      </div>
      <div class="flex min-w-0 items-end justify-between gap-2">
        <div class="min-w-0">
          <slot name="bottomLeft"><div /></slot>
        </div>
        <div class="shrink-0">
          <slot name="bottomRight" />
        </div>
      </div>
    </div>
  </Card>
</template>
