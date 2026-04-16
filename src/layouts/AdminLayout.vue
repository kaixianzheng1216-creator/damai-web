<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { Separator } from '@/components/common/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/common/ui/sidebar'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/common/ui/breadcrumb'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((r) => r.meta?.title)
  return matched.map((r) => ({
    label: r.meta?.title as string,
    path: r.path,
  }))
})
</script>

<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset>
      <header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mx-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink as-child>
                  <RouterLink to="/admin">管理后台</RouterLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{{ crumb.label }}</BreadcrumbPage>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main class="flex-1 p-6 overflow-auto">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
