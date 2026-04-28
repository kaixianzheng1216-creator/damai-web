<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

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
      <button
        type="button"
        v-for="item in options"
        :key="item.value"
        :class="
          cn(
            'rounded-sm px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
            item.value === activeValue
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted',
          )
        "
        @click="emit('change', item.value)"
      >
        {{ item.label }}
      </button>
    </div>
    <button
      type="button"
      v-if="overflows || expanded"
      class="flex shrink-0 items-center gap-0.5 pt-1 text-sm text-primary transition-colors hover:text-primary/80"
      @click="expanded = !expanded"
    >
      {{ expanded ? '收起' : '更多' }}
      <icon-lucide-chevron-down
        class="h-3.5 w-3.5 transition-transform duration-200"
        :class="expanded ? 'rotate-180' : ''"
      />
    </button>
  </div>
</template>
