<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { adminDashboardModules } from '@/constants'

const router = useRouter()
const adminStore = useAdminStore()

const adminName = computed(() => adminStore.adminInfo?.username ?? '管理员')

const navigate = (path: string) => router.push(path)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">欢迎回来，{{ adminName }} 👋</h1>
      <p class="text-muted-foreground mt-1 text-sm">这是大麦票务管理后台，请选择要管理的模块。</p>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-semibold text-foreground mb-4">快捷操作</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <button
          v-for="item in adminDashboardModules"
          :key="item.key"
          class="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          @click="navigate(item.path)"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
          >
            <component :is="item.icon" class="h-6 w-6" />
          </div>
          <span class="text-sm font-medium text-foreground">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
