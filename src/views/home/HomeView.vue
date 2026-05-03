<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useHomePage } from '@/composables/home/useHomePage'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'

const AIAssistant = defineAsyncComponent(() => import('@/components/common/AIAssistant.vue'))

const { banners, categories, eventSections, isLoading, isError } = useHomePage()
</script>

<template>
  <div class="container mx-auto space-y-3 px-4 py-3 md:space-y-8 md:px-6 md:py-6">
    <LoadingState v-if="isLoading" size="lg" message="正在为您加载精彩演出..." />

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
