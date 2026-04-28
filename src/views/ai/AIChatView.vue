<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AI_QUICK_PROMPTS } from '@/constants'
import {
  AIChatEmptyState,
  AIChatHeader,
  AIChatInput,
  AIChatMessageList,
} from '@/components/features/ai'
import { useAIChat } from '@/composables/useAIChat'
import assistantAvatar from '@/assets/assistant/assistant.webp'

const router = useRouter()
const inputValue = ref('')
const inputRef = ref<InstanceType<typeof AIChatInput>>()

const { messages, isPending, submit, resetSession } = useAIChat()

const hasChatStarted = computed(() => messages.value.some((message) => message.role === 'user'))

const focusInput = () => {
  void inputRef.value?.focus()
}

const handleSubmit = (text: string) => {
  if (isPending.value) {
    return
  }

  submit(text)
  inputValue.value = ''
  focusInput()
}

const handleReset = () => {
  resetSession()
  inputValue.value = ''
  focusInput()
}

const goBack = () => {
  resetSession()
  router.back()
}
</script>

<template>
  <div
    class="grid grid-rows-[auto_1fr_auto] overflow-hidden bg-muted/40 h-[calc(100dvh-var(--layout-header)-var(--layout-mobile-nav))] md:h-[calc(100vh-var(--layout-header-desktop))]"
  >
    <AIChatHeader @back="goBack" @reset="handleReset" />

    <AIChatEmptyState
      v-if="!hasChatStarted"
      :assistant-avatar="assistantAvatar"
      :quick-prompts="AI_QUICK_PROMPTS"
      @prompt="handleSubmit"
    />
    <AIChatMessageList
      v-else
      :messages="messages"
      :is-pending="isPending"
      :assistant-avatar="assistantAvatar"
      @suggestion="handleSubmit"
    />

    <AIChatInput
      ref="inputRef"
      v-model="inputValue"
      :is-pending="isPending"
      @submit="handleSubmit"
    />
  </div>
</template>
