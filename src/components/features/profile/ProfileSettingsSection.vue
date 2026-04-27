<script setup lang="ts">
import type { AccountSettingItem } from '@/api/account'

defineProps<{
  accountSettings: AccountSettingItem[]
}>()

const emit = defineEmits<{
  action: [item: AccountSettingItem]
}>()
</script>

<template>
  <div class="space-y-3">
    <div v-for="item in accountSettings" :key="item.key" class="section-card">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <icon-lucide-check
            v-if="item.status === 'success'"
            class="mt-0.5 h-5 w-5 text-green-600"
          />
          <icon-lucide-triangle-alert v-else class="mt-0.5 h-5 w-5 text-amber-500" />
          <div>
            <p class="font-semibold text-foreground">{{ item.title }}</p>
            <p v-if="item.description" class="text-sm text-muted-foreground">
              {{ item.description }}
            </p>
            <p v-if="item.value" class="text-sm text-muted-foreground">{{ item.value }}</p>
          </div>
        </div>
        <button type="button" class="text-sky-600 hover:underline" @click="emit('action', item)">
          {{ item.actionText }}
        </button>
      </div>
    </div>
  </div>
</template>
