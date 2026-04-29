<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useHomePage } from '@/composables/home/useHomePage'
import ErrorState from '@/components/common/ErrorState.vue'

const AIAssistant = defineAsyncComponent(() => import('@/components/common/AIAssistant.vue'))

const { banners, categories, eventSections, isLoading, isError } = useHomePage()
</script>

<template>
  <div class="container mx-auto space-y-3 px-4 py-3 md:space-y-8 md:px-6 md:py-6">
    <div v-if="isLoading" class="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <icon-lucide-loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="animate-pulse text-muted-foreground">正在为您加载精彩演出...</p>
    </div>

    <ErrorState v-else-if="isError" class="min-h-[60vh]" />

    <template v-else>
      <HomeBanner :banners="banners" />
      <CategoryNav :categories="categories" />

      <EventSection
        v-for="section in eventSections"
        :key="section.key"
        :title="section.title"
        :link-url="section.linkUrl"
        :events="section.events"
      />

      <div
        class="fixed right-6 bottom-[calc(var(--height-mobile-nav)+1rem)] z-50 flex flex-col items-end gap-3 md:bottom-6"
      >
        <AIAssistant />
        <HomeFloatingSupport />
      </div>
    </template>
  </div>
</template>
