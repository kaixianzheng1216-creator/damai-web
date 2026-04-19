<script setup lang="ts">
defineProps<{
  title: string
  description: string
  alternateText?: string
  alternateLinkText?: string
  alternateLinkTo?: string
}>()
</script>

<template>
  <div class="min-h-screen flex-center bg-background px-4">
    <div class="w-full max-w-[400px] space-y-6">
      <div class="flex flex-col items-center space-y-2 text-center">
        <RouterLink to="/" class="flex items-center space-x-2 mb-2">
          <icon-lucide-ticket class="w-10 h-10 text-primary rotate-[-10deg]" />
          <span class="text-3xl font-black text-primary">Damai</span>
        </RouterLink>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ title }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>

      <div class="grid gap-6">
        <slot />

        <div v-if="alternateText && alternateLinkText && alternateLinkTo" class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground"> OR </span>
          </div>
        </div>

        <div
          v-if="alternateText && alternateLinkText && alternateLinkTo"
          class="text-center text-sm text-muted-foreground"
        >
          {{ alternateText }}
          <RouterLink
            :to="alternateLinkTo"
            class="underline underline-offset-4 hover:text-primary text-foreground font-medium"
          >
            {{ alternateLinkText }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
