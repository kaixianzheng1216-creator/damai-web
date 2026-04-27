<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/common/ui/sidebar'
import NavUser from '@/components/admin/NavUser.vue'
import { adminModules } from '@/constants'

const route = useRoute()

const isActive = (url: string) => {
  if (url === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(url)
}
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child class="data-[slot=sidebar-menu-button]:!p-1.5">
            <RouterLink to="/admin">
              <icon-lucide-ticket class="!size-5 rotate-[-10deg] text-primary" />
              <span class="text-base font-black text-primary">Damai</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem v-for="item in adminModules" :key="item.key">
              <SidebarMenuButton as-child :is-active="isActive(item.path)">
                <RouterLink :to="item.path">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
</template>
