<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AI_QUICK_PROMPTS, AI_SUPPORT_QUICK_PROMPTS, AI_CHAT_COPY } from '@/constants'
import {
  AIChatEmptyState,
  AIChatHeader,
  AIChatInput,
  AIChatMessageList,
} from '@/components/features/ai'
import { useAIChat } from '@/composables/useAIChat'
import assistantAvatar from '@/assets/assistant/assistant.webp'

const router = useRouter()
const route = useRoute()
const inputValue = ref('')
const inputRef = ref<InstanceType<typeof AIChatInput>>()

const isSupportMode = computed(() => route.query.mode === 'support')

const chatOptions = computed(() =>
  isSupportMode.value
    ? {
        flowName: 'support',
        welcomeMessage:
          '你好！我是 Damai 客服助手，可以帮你查订单、查电子票、或者提交工单给人工客服。请问有什么可以帮你的？',
        enableCityContext: false,
      }
    : {},
)

const quickPrompts = computed(() =>
  isSupportMode.value ? AI_SUPPORT_QUICK_PROMPTS : AI_QUICK_PROMPTS,
)

const chatTitle = computed(() => (isSupportMode.value ? 'Damai 客服助手' : AI_CHAT_COPY.title))

const chatSubtitle = computed(() =>
  isSupportMode.value ? '为你查询订单、解答售后问题' : AI_CHAT_COPY.subtitle,
)

const { messages, isPending, submit, resetSession } = useAIChat(chatOptions)

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
  if (isSupportMode.value) {
    router.push('/profile')
  } else {
    router.back()
  }
}
</script>

<template>
  <div
    class="grid grid-rows-[auto_1fr_auto] overflow-hidden bg-muted/40 h-[calc(100dvh-var(--layout-header)-var(--layout-mobile-nav))] md:h-[calc(100vh-var(--layout-header-desktop))]"
  >
    <AIChatHeader :title="chatTitle" :subtitle="chatSubtitle" @back="goBack" @reset="handleReset" />

    <AIChatEmptyState
      v-if="!hasChatStarted"
      :assistant-avatar="assistantAvatar"
      :quick-prompts="quickPrompts"
      :empty-title="isSupportMode ? '你好！我是 Damai 客服助手' : undefined"
      :empty-description="
        isSupportMode ? '我可以帮你查订单、查电子票、或者提交工单给人工客服。' : undefined
      "
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
