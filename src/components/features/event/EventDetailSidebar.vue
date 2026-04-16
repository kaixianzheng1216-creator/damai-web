<script setup lang="ts">
import type { EventServiceGuaranteeVO } from '@/api/event'

defineProps<{
  services: EventServiceGuaranteeVO[]
}>()
</script>

<template>
  <aside class="border border-border bg-background p-4 xl:p-5">
    <p class="text-base font-semibold text-foreground">服务保障</p>

    <div class="mt-4 space-y-4">
      <div v-for="item in services" :key="item.id">
        <p class="text-sm text-muted-foreground">{{ item.serviceGuarantee.name }}</p>
        <p class="mt-1 text-sm leading-7 text-foreground">
          {{ item.serviceGuaranteeOption.name }}
        </p>
      </div>

      <p v-if="services.length === 0" class="text-xs text-muted-foreground">暂无服务保障信息</p>
    </div>
  </aside>
</template>
