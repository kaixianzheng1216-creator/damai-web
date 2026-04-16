<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  IconCalendar,
  IconLayoutDashboard,
  IconUsers,
  IconMapPin,
  IconTags,
  IconBuilding,
  IconPhoto,
  IconUserCircle,
  IconStack,
  IconFileText,
  IconShieldCheck,
  IconTicket,
} from '@tabler/icons-vue'
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

interface NavItem {
  title: string
  url: string
  icon: Component
}

const route = useRoute()

const navItems: NavItem[] = [
  {
    title: '仪表盘',
    url: '/admin',
    icon: IconLayoutDashboard,
  },
  {
    title: 'Banner 管理',
    url: '/admin/banners',
    icon: IconPhoto,
  },
  {
    title: '活动管理',
    url: '/admin/events',
    icon: IconCalendar,
  },
  {
    title: '系列管理',
    url: '/admin/series',
    icon: IconStack,
  },
  {
    title: '城市管理',
    url: '/admin/cities',
    icon: IconMapPin,
  },
  {
    title: '分类管理',
    url: '/admin/categories',
    icon: IconTags,
  },
  {
    title: '场馆管理',
    url: '/admin/venues',
    icon: IconBuilding,
  },
  {
    title: '参与方管理',
    url: '/admin/participants',
    icon: IconUserCircle,
  },
  {
    title: '须知模板',
    url: '/admin/notices',
    icon: IconFileText,
  },
  {
    title: '服务保障',
    url: '/admin/services',
    icon: IconShieldCheck,
  },
  {
    title: '管理员管理',
    url: '/admin/admins',
    icon: IconUsers,
  },
]

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
          <SidebarMenuButton
            as-child
            class="data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <RouterLink to="/admin">
              <IconTicket class="!size-5" />
              <span class="text-base font-semibold">大麦后台</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.title">
              <SidebarMenuButton
                as-child
                :is-active="isActive(item.url)"
              >
                <RouterLink :to="item.url">
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
