<script setup lang="ts">
import type { ProfileSectionOption, ProfileSectionKey } from '@/constants'

defineProps<{
  activeSection: ProfileSectionKey
  tradeSections: ProfileSectionOption[]
  accountSections: ProfileSectionOption[]
}>()

const emit = defineEmits<{
  'open-section': [section: ProfileSectionKey]
}>()
</script>

<template>
  <aside class="sticky top-20 h-fit rounded-2xl border border-border bg-background p-4 shadow-sm">
    <div class="mb-4 px-1 py-1 text-lg font-semibold text-foreground">用户中心</div>

    <div class="space-y-4">
      <div>
        <p class="mb-2 px-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
          交易中心
        </p>
        <div class="space-y-1">
          <button
            type="button"
            v-for="item in tradeSections"
            :key="item.key"
            class="h-10 w-full rounded-lg border border-transparent px-3 text-left text-[15px] font-medium text-foreground transition-colors duration-200 ease-out motion-reduce:transition-none"
            :class="
              activeSection === item.key
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'hover:bg-muted'
            "
            @click="emit('open-section', item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-2 px-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
          账户中心
        </p>
        <div class="space-y-1">
          <button
            type="button"
            v-for="item in accountSections"
            :key="item.key"
            class="h-10 w-full rounded-lg border border-transparent px-3 text-left text-[15px] font-medium text-foreground transition-colors duration-200 ease-out motion-reduce:transition-none"
            :class="
              activeSection === item.key
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'hover:bg-muted'
            "
            @click="emit('open-section', item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
