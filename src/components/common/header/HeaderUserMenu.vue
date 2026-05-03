<script setup lang="ts">
import type { ProfileSectionKey } from '@/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/ui/dropdown-menu'

defineProps<{
  isLoggedIn: boolean
  displayName: string
  avatarUrl: string
  items: { section: ProfileSectionKey; label: string }[]
}>()

const emit = defineEmits<{
  'open-section': [section: ProfileSectionKey]
  logout: []
}>()
</script>

<template>
  <div class="ml-6 flex items-center">
    <RouterLink v-if="!isLoggedIn" to="/login">
      <Button variant="ghost" size="sm" class="flex items-center gap-1">
        <icon-lucide-user class="h-4 w-4" />
        <span>登录</span>
      </Button>
    </RouterLink>

    <DropdownMenu v-else>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
        >
          <img :src="avatarUrl" alt="用户头像" class="h-8 w-8 rounded-full object-cover" />
          <span class="max-w-[96px] truncate text-sm text-foreground">{{ displayName }}</span>
          <icon-lucide-chevron-down class="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-40">
        <DropdownMenuItem
          v-for="item in items"
          :key="item.section"
          @select="emit('open-section', item.section)"
        >
          {{ item.label }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="text-destructive" @select="emit('logout')">
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
