<script setup lang="ts">
import TheHeader from '@/components/common/TheHeader.vue'
import MobileBottomNav from '@/components/common/MobileBottomNav.vue'
</script>

<template>
  <div class="pb-14 md:pb-0">
    <TheHeader />
    <router-view />
    <MobileBottomNav />
  </div>
</template>
