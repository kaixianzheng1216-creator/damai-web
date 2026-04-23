import { ref, computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { chatWithAI } from '@/api/ai'
import type { ChatMessage, AiChatItem } from '@/api/ai/types'

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useAIChat() {
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

    messages.value.push({ role: 'user', content: trimmed })
    sendMessage(trimmed)
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
