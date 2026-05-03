<script setup lang="ts">
import { computed } from 'vue'
import ProfileMobileBottomNav from './ProfileMobileBottomNav.vue'
import ProfileSidebar from './ProfileSidebar.vue'
import type { ProfileSectionKey, ProfileSectionOption } from '@/constants'

const props = defineProps<{
  activeSection: ProfileSectionKey
  tradeSections: ProfileSectionOption[]
  accountSections: ProfileSectionOption[]
  currentTitle: string
  activeSectionLoading: boolean
}>()

defineEmits<{
  (e: 'open-section', section: ProfileSectionKey): void
}>()

const allSections = computed(() => [...props.tradeSections, ...props.accountSections])
</script>

<template>
  <div class="bg-background py-4 md:py-6">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid items-start gap-4 lg:grid-cols-[240px_1fr] lg:gap-6">
        <ProfileSidebar
          class="hidden lg:block"
          :active-section="activeSection"
          :trade-sections="tradeSections"
          :account-sections="accountSections"
          @open-section="$emit('open-section', $event)"
        />

        <div class="space-y-4">
          <ProfileMobileBottomNav
            :active-section="activeSection"
            :all-sections="allSections"
            @open-section="$emit('open-section', $event)"
          />

          <section
            class="rounded-2xl border border-border bg-background p-4 shadow-sm md:p-5 lg:p-6"
          >
            <div v-if="activeSectionLoading" class="flex min-h-[320px] items-center justify-center">
              <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
            </div>

            <template v-else>
              <div
                class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 md:mb-5"
              >
                <h1 class="text-lg font-semibold text-foreground md:text-xl">
                  {{ currentTitle }}
                </h1>
              </div>

              <slot />
            </template>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
