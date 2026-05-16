<script setup lang="ts">
import type { ProfileSectionOption, ProfileSectionKey } from '@/constants'
import { Button } from '@/components/common/ui/button'

defineProps<{
  activeSection: ProfileSectionKey
  allSections: ProfileSectionOption[]
}>()

const emit = defineEmits<{
  'open-section': [section: ProfileSectionKey]
}>()
</script>

<template>
  <div class="-mx-3 overflow-x-auto px-3 scrollbar-hide lg:hidden">
    <div class="flex w-max gap-2">
      <Button
        v-for="section in allSections"
        :key="section.key"
        type="button"
        size="sm"
        :variant="activeSection === section.key ? undefined : 'ghost'"
        class="shrink-0 rounded-full"
        @click="emit('open-section', section.key)"
      >
        {{ section.label }}
      </Button>
    </div>
  </div>
</template>
