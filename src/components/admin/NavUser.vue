<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { IconLogout, IconUserCircle } from "@tabler/icons-vue"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/common/ui/avatar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/common/ui/sidebar'

const router = useRouter()
const userStore = useUserStore()

const adminName = computed(() => userStore.adminInfo?.username ?? '')
const adminAvatarUrl = computed(() => userStore.adminInfo?.avatarUrl)

const handleLogout = async () => {
  userStore.clearAdminInfo()
  await router.push('/admin/login')
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <div class="flex items-center gap-3 px-2 py-1.5">
        <Avatar class="h-8 w-8 rounded-lg">
          <AvatarImage v-if="adminAvatarUrl" :src="adminAvatarUrl" :alt="adminName" />
          <AvatarFallback class="rounded-lg">
            <IconUserCircle class="size-4" />
          </AvatarFallback>
        </Avatar>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-medium">{{ adminName }}</span>
        </div>
        <SidebarMenuButton
          size="sm"
          class="ml-auto"
          @click="handleLogout"
        >
          <IconLogout class="size-4" />
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
