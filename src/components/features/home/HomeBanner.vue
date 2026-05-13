<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/common/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import type { HomeBannerItem } from '@/api/event'

const props = defineProps<{
  banners: HomeBannerItem[]
}>()

const fallbackBanner: HomeBannerItem = {
  id: 'fallback-banner',
  cityId: '',
  title: 'Banner1',
  imageUrl: 'https://placehold.jp/1920x768.png?text=Banner1',
  mobileImageUrl: 'https://placehold.jp/750x422.png?text=Banner1',
  jumpUrl: '#',
  sortOrder: 0,
  displayStartAt: '',
  displayEndAt: '',
}

const displayBanners = computed<HomeBannerItem[]>(() =>
  props.banners.length > 0 ? props.banners : [fallbackBanner],
)

const api = shallowRef<CarouselApi>()
const currentIndex = shallowRef(0)

watch(api, (newApi) => {
  if (!newApi) return
  newApi.on('select', () => {
    currentIndex.value = newApi.selectedScrollSnap()
  })
})

watch(displayBanners, (banners) => {
  if (currentIndex.value < banners.length) return
  currentIndex.value = 0
  api.value?.scrollTo(0)
})
</script>

<template>
  <Carousel
    class="group relative aspect-[16/9] w-full overflow-hidden rounded-lg md:aspect-[5/2] md:rounded-xl"
    :opts="{ loop: true }"
    :plugins="[Autoplay({ delay: 5000, stopOnMouseEnter: true })]"
    @init-api="api = $event"
  >
    <CarouselContent class="-ml-0">
      <CarouselItem v-for="banner in displayBanners" :key="banner.id" class="pl-0">
        <RouterLink :to="banner.jumpUrl || '#'" class="block h-full w-full">
          <picture>
            <source :srcset="banner.mobileImageUrl || banner.imageUrl" media="(max-width: 767px)" />
            <img
              :src="banner.imageUrl"
              :alt="banner.title || '首页 Banner'"
              loading="lazy"
              class="h-full w-full object-cover"
            />
          </picture>
        </RouterLink>
      </CarouselItem>
    </CarouselContent>

    <CarouselPrevious
      class="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-black/30 text-white opacity-0 transition-opacity hover:bg-black/50 md:flex md:opacity-0 md:group-hover:opacity-100"
    />
    <CarouselNext
      class="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-black/30 text-white opacity-0 transition-opacity hover:bg-black/50 md:flex md:opacity-0 md:group-hover:opacity-100"
    />

    <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-4 md:gap-2">
      <button
        type="button"
        v-for="(_, index) in displayBanners"
        :key="index"
        class="h-1.5 rounded-full bg-white/50 transition-all duration-300 hover:bg-white/80 md:h-2"
        :class="currentIndex === index ? 'w-4 bg-white md:w-6' : 'w-1.5 md:w-2'"
        :aria-label="`切换到第 ${index + 1} 张 Banner`"
        @click="api?.scrollTo(index)"
      />
    </div>
  </Carousel>
</template>
