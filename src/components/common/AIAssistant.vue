<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const goToAI = () => {
  if (userStore.isLoggedIn) {
    router.push('/ai')
  } else {
    router.push({ name: 'login', query: { redirect: '/ai' } })
  }
}

const isAIChatPage = computed(() => route.path === '/ai')
</script>

<template>
  <button
    v-if="!isAIChatPage"
    type="button"
    class="flex h-11 min-w-[108px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
    @click="goToAI"
  >
    <icon-lucide-bot class="h-4 w-4 text-primary" />
    智能助手
  </button>
</template>
