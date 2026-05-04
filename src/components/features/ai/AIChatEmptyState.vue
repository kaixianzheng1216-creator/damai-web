<script setup lang="ts">
import { AI_CHAT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'

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
      <Button
        v-for="prompt in quickPrompts"
        :key="prompt"
        type="button"
        variant="outline"
        class="h-auto rounded-full px-5 py-2.5"
        @click="$emit('prompt', prompt)"
      >
        {{ prompt }}
      </Button>
    </div>
  </div>
</template>
