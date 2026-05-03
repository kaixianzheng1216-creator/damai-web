<script setup lang="ts">
import { AI_CHAT_COPY } from '@/constants'

withDefaults(
  defineProps<{
    assistantAvatar: string
    quickPrompts: readonly string[]
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    emptyTitle: AI_CHAT_COPY.emptyTitle,
    emptyDescription: AI_CHAT_COPY.emptyDescription,
  },
)

defineEmits<{
  prompt: [text: string]
}>()
</script>

<template>
  <div
    class="mx-auto flex min-h-full w-full max-w-[800px] flex-col items-center justify-center px-4 py-12"
  >
    <img :src="assistantAvatar" alt="AI助手" class="mb-6 h-auto max-h-36 w-auto object-contain" />
    <h2 class="mb-2 text-center text-2xl font-bold text-foreground">
      {{ emptyTitle }}
    </h2>
    <p class="mb-10 text-center text-base text-muted-foreground">
      {{ emptyDescription }}
    </p>
    <div class="flex flex-wrap justify-center gap-3">
      <button
        v-for="prompt in quickPrompts"
        :key="prompt"
        type="button"
        class="h-auto cursor-pointer rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary hover:text-primary active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        @click="$emit('prompt', prompt)"
      >
        {{ prompt }}
      </button>
    </div>
  </div>
</template>
