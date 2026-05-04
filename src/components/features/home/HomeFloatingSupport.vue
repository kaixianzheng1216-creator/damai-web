<script setup lang="ts">
const { y } = useWindowScroll({ behavior: 'smooth' })

const scrollToTop = () => {
  y.value = 0
}
</script>

<template>
  <button
    type="button"
    class="flex h-11 min-w-[108px] items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
    @click="scrollToTop"
  >
    <icon-lucide-arrow-up class="mr-1 h-4 w-4 text-primary" />
    返回顶部
  </button>
</template>
