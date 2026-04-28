<script setup lang="ts">
import { computed } from 'vue'
import ProfileMobileBottomNav from './ProfileMobileBottomNav.vue'
import ProfileSidebar from './ProfileSidebar.vue'
import { useProfilePageContext } from './profilePageContext'

const profile = useProfilePageContext()

const allSections = computed(() => [
  ...profile.tradeSections.value,
  ...profile.accountSections.value,
])
</script>

<template>
  <div class="bg-background py-4 md:py-6">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid items-start gap-4 lg:grid-cols-[240px_1fr] lg:gap-6">
        <ProfileSidebar
          class="hidden lg:block"
          :active-section="profile.activeSection.value"
          :trade-sections="profile.tradeSections.value"
          :account-sections="profile.accountSections.value"
          @open-section="profile.openSection"
        />

        <div class="space-y-4">
          <ProfileMobileBottomNav
            :active-section="profile.activeSection.value"
            :all-sections="allSections"
            @open-section="profile.openSection"
          />

          <section
            class="rounded-2xl border border-border bg-background p-4 shadow-sm md:p-5 lg:p-6"
          >
            <div
              v-if="profile.activeSectionLoading.value"
              class="flex min-h-[320px] items-center justify-center"
            >
              <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
            </div>

            <template v-else>
              <div
                class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 md:mb-5"
              >
                <h1 class="text-lg font-semibold text-foreground md:text-xl">
                  {{ profile.currentTitle.value }}
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
