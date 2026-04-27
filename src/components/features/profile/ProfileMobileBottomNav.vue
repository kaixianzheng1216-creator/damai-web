<script setup lang="ts">
import type { ProfileSectionOption, ProfileSectionKey } from '@/constants'

defineProps<{
  activeSection: ProfileSectionKey
  allSections: ProfileSectionOption[]
}>()

const emit = defineEmits<{
  'open-section': [section: ProfileSectionKey]
}>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto scrollbar-hide lg:hidden">
    <button
      type="button"
      v-for="section in allSections"
      :key="section.key"
      class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
      :class="
        activeSection === section.key
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:text-foreground'
      "
      @click="emit('open-section', section.key)"
    >
      {{ section.label }}
    </button>
  </div>
</template>
