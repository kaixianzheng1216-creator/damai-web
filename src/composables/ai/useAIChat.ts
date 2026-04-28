import { ref, computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { useStorage } from '@vueuse/core'
import { chatWithAI } from '@/api/ai'
import type { ChatMessage } from '@/api/ai/types'
import { COMMON_CONFIG } from '@/constants'
import { buildAIChatPrompt } from './aiChatPrompt'

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useAIChat() {
  const selectedCity = useStorage('selected-city', COMMON_CONFIG.DEFAULT_CITY)

  const sessionId = ref<string>(generateSessionId())
  const messages = ref<ChatMessage[]>([
    {
      role: 'ai',
      content:
        '你好！我是 Damai 智能助手，可以帮你找演出、推荐活动、解答购票问题。请问有什么可以帮你的？',
    },
  ])

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (message: string) =>
      chatWithAI({
        flowName: 'assistant',
        message,
        sessionId: sessionId.value,
      }),
    onSuccess: (data) => {
      messages.value.push({
        role: 'ai',
        content: data.message,
        items: data.items,
        suggestions: data.suggestions,
      })
    },
    onError: () => {
      messages.value.push({
        role: 'ai',
        content: '抱歉，服务暂时不可用，请稍后再试。',
      })
    },
  })

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isPending.value) return

    const isFirstUserMessage = !messages.value.some((m) => m.role === 'user')

    let sendContent = trimmed
    if (isFirstUserMessage) {
      sendContent = buildAIChatPrompt(trimmed, selectedCity.value)
    }

    messages.value.push({ role: 'user', content: trimmed })
    sendMessage(sendContent)
  }

  const resetSession = () => {
    sessionId.value = generateSessionId()
    messages.value = [
      {
        role: 'ai',
        content:
          '你好！我是 Damai 智能助手，可以帮你找演出、推荐活动、解答购票问题。请问有什么可以帮你的？',
      },
    ]
  }

  const lastSuggestions = computed(() => {
    const lastAi = [...messages.value].reverse().find((m) => m.role === 'ai')
    return lastAi?.suggestions ?? []
  })

  return {
    messages,
    isPending,
    submit,
    resetSession,
    lastSuggestions,
  }
}
