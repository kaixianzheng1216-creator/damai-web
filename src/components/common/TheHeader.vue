<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderCitySelector from '@/components/common/header/HeaderCitySelector.vue'
import HeaderSearchBar from '@/components/common/header/HeaderSearchBar.vue'
import HeaderUserMenu from '@/components/common/header/HeaderUserMenu.vue'
import { useHeaderState } from '@/composables/common/useHeaderState'

const route = useRoute()

const {
  cityMenuOpen,
  selectedCity,
  searchQuery,
  hotCities,
  otherCities,
  displayName,
  avatarUrl,
  headerProfileMenuItems,
  isLoggedIn,
  selectCity,
  openProfileSection,
  handleLogout,
  handleSearch,
} = useHeaderState()

const showCitySelector = computed(() => route.name !== 'category')
</script>

<template>
  <header class="z-50 w-full border-b bg-background shadow-sm">
    <div class="container mx-auto flex h-12 items-center px-4 md:h-16 md:px-6">
      <RouterLink to="/" class="mr-4 hidden items-center space-x-2 md:flex">
        <icon-lucide-ticket class="h-8 w-8 rotate-[-10deg] text-primary" />
        <span class="text-xl font-black text-primary">Damai</span>
      </RouterLink>

      <HeaderCitySelector
        v-if="showCitySelector"
        v-model:open="cityMenuOpen"
        :selected-city="selectedCity"
        :hot-cities="hotCities"
        :other-cities="otherCities"
        @select="selectCity"
      />

      <nav class="mr-6 hidden items-center space-x-6 text-sm font-medium md:flex">
        <RouterLink to="/" class="text-foreground transition-colors hover:text-primary"
          >首页</RouterLink
        >
        <RouterLink to="/category" class="text-foreground transition-colors hover:text-primary"
          >分类</RouterLink
        >
      </nav>

      <HeaderSearchBar v-model="searchQuery" @submit="handleSearch" />

      <div class="ml-4 hidden items-center space-x-4 text-sm font-medium md:flex">
        <RouterLink
          to="/ai?mode=support"
          class="text-foreground transition-colors hover:text-primary"
        >
          客服
        </RouterLink>
      </div>

      <div class="hidden md:block">
        <HeaderUserMenu
          :is-logged-in="isLoggedIn"
          :display-name="displayName"
          :avatar-url="avatarUrl"
          :items="headerProfileMenuItems"
          @open-section="openProfileSection"
          @logout="handleLogout"
        />
      </div>
    </div>
  </header>
</template>
