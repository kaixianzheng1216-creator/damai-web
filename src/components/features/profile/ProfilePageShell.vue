<script setup lang="ts">
import { computed } from 'vue'
import ProfileMobileBottomNav from './ProfileMobileBottomNav.vue'
import ProfileSidebar from './ProfileSidebar.vue'
import { Button } from '@/components/common/ui/button'
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
  (e: 'logout'): void
}>()

const allSections = computed(() => [...props.tradeSections, ...props.accountSections])
</script>

<template>
  <div class="bg-background py-3 md:py-6">
    <div class="container mx-auto min-w-0 px-3 md:px-6">
      <div class="grid min-w-0 items-start gap-3 lg:grid-cols-[240px_1fr] lg:gap-6">
        <ProfileSidebar
          class="hidden lg:block"
          :active-section="activeSection"
          :trade-sections="tradeSections"
          :account-sections="accountSections"
          @open-section="$emit('open-section', $event)"
        />

        <div class="min-w-0 space-y-3 md:space-y-4">
          <ProfileMobileBottomNav
            :active-section="activeSection"
            :all-sections="allSections"
            @open-section="$emit('open-section', $event)"
          />

          <section
            class="rounded-xl border border-border bg-background p-3 shadow-sm md:rounded-2xl md:p-5 lg:p-6"
          >
            <div v-if="activeSectionLoading" class="flex min-h-[320px] items-center justify-center">
              <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
            </div>

            <template v-else>
              <div
                class="mb-3 flex items-center justify-between border-b border-border pb-3 md:mb-5 md:pb-4"
              >
                <h1 class="text-lg font-semibold text-foreground md:text-xl">
                  {{ currentTitle }}
                </h1>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-8 shrink-0 text-destructive lg:hidden"
                  @click="$emit('logout')"
                >
                  退出登录
                </Button>
              </div>

              <slot />
            </template>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
