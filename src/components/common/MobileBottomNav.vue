<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/', name: 'home', label: '首页', icon: 'Home' },
  { to: '/category', name: 'category', label: '分类', icon: 'LayoutGrid' },
  { to: '/profile', name: 'profile', label: '我的', icon: 'User' },
] as const

const isActive = (name: string) => {
  if (name === 'home') return route.name === 'home'
  if (name === 'category') return route.name === 'category'
  if (name === 'profile') return route.name === 'profile'
  return false
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur pb-safe md:hidden"
  >
    <div class="flex h-14 items-stretch">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors"
        :class="isActive(tab.name) ? 'text-primary' : 'text-muted-foreground'"
      >
        <icon-lucide-home v-if="tab.icon === 'Home'" class="h-5 w-5" />
        <icon-lucide-layout-grid v-else-if="tab.icon === 'LayoutGrid'" class="h-5 w-5" />
        <icon-lucide-user v-else-if="tab.icon === 'User'" class="h-5 w-5" />
        <span>{{ tab.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
