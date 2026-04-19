<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { IconLogout, IconUserCircle } from '@tabler/icons-vue'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/ui/avatar'
import { Button } from '@/components/common/ui/button'
import { SidebarMenu, SidebarMenuItem } from '@/components/common/ui/sidebar'

const router = useRouter()
const adminStore = useAdminStore()

const adminName = computed(() => adminStore.adminInfo?.username ?? '')
const adminAvatarUrl = computed(() => adminStore.adminInfo?.avatarUrl)

const handleLogout = async () => {
  adminStore.clearAdminInfo()
  await router.push('/admin/login')
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <div class="flex items-center gap-3 px-2 py-1.5">
        <Avatar class="h-8 w-8 rounded-lg shrink-0">
          <AvatarImage v-if="adminAvatarUrl" :src="adminAvatarUrl" :alt="adminName" />
          <AvatarFallback class="rounded-lg">
            <IconUserCircle class="size-4" />
          </AvatarFallback>
        </Avatar>
        <div class="flex-1 text-left text-sm leading-tight min-w-0">
          <span class="truncate font-medium block">{{ adminName }}</span>
        </div>
        <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="handleLogout">
          <IconLogout class="size-4" />
        </Button>
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
