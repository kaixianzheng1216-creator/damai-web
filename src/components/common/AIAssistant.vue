<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/common/ui/button'

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
  <Button
    v-if="!isAIChatPage"
    variant="outline"
    class="h-11 min-w-[108px] rounded-xl gap-1.5"
    @click="goToAI"
  >
    <icon-lucide-bot class="h-4 w-4 text-primary" />
    智能助手
  </Button>
</template>
