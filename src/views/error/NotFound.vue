<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div
    class="min-h-screen flex flex-col flex-center bg-background px-4 pb-(--height-mobile-nav) md:pb-0"
  >
    <div class="text-center space-y-6 max-w-md">
      <div class="relative">
        <p class="text-[8rem] font-black text-primary/10 leading-none select-none">404</p>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-foreground">页面不存在</h1>
        <p class="text-muted-sm">您访问的页面已被移除或不存在，请返回继续浏览。</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          @click="router.push('/')"
        >
          <icon-lucide-home class="h-4 w-4" />
          返回首页
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          @click="router.back()"
        >
          <icon-lucide-arrow-left class="h-4 w-4" />
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>
