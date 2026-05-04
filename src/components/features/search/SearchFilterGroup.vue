<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Button } from '@/components/common/ui/button'

const props = defineProps<{
  label: string
  options: ReadonlyArray<{ label: string; value: string | number | undefined }>
  activeValue: string | number | undefined
}>()

const emit = defineEmits<{
  change: [value: string | number | undefined]
}>()

const expanded = ref(false)
const overflows = ref(false)
const listRef = ref<HTMLElement>()

const checkOverflow = () => {
  const el = listRef.value
  if (!el) return
  overflows.value = el.scrollHeight > el.clientHeight + 2
}

watch(
  () => props.options,
  async () => {
    await nextTick()
    checkOverflow()
  },
)

useResizeObserver(listRef, checkOverflow)
</script>

<template>
  <div class="flex items-start gap-4 border-b border-border py-4 last:border-b-0">
    <p class="w-12 shrink-0 pt-1 text-sm text-muted-foreground">{{ label }}</p>
    <div
      ref="listRef"
      class="flex flex-1 flex-wrap gap-2 transition-all duration-200"
      :class="expanded ? '' : 'max-h-[36px] overflow-hidden'"
    >
      <Button
        v-for="item in options"
        :key="item.value"
        type="button"
        size="sm"
        :variant="item.value === activeValue ? undefined : 'ghost'"
        class="rounded-sm whitespace-nowrap"
        @click="emit('change', item.value)"
      >
        {{ item.label }}
      </Button>
    </div>
    <Button
      v-if="overflows || expanded"
      type="button"
      variant="ghost"
      size="sm"
      class="shrink-0 pt-1"
      @click="expanded = !expanded"
    >
      {{ expanded ? '收起' : '更多' }}
      <icon-lucide-chevron-down
        class="h-3.5 w-3.5 transition-transform duration-200"
        :class="expanded ? 'rotate-180' : ''"
      />
    </Button>
  </div>
</template>
