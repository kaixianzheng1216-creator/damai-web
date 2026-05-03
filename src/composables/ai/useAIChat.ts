import { ref, computed, watch, toRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { useStorage } from '@vueuse/core'
import { chatWithAI } from '@/api/ai'
import type { ChatMessage } from '@/api/ai/types'
import { COMMON_CONFIG, AI_CHAT_COPY } from '@/constants'
import { buildAIChatPrompt } from '@/utils/aiChatPrompt'

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface UseAIChatOptions {
  flowName?: string
  welcomeMessage?: string
  enableCityContext?: boolean
}

export function useAIChat(options: MaybeRefOrGetter<UseAIChatOptions> = {}) {
  const optionsRef = toRef(options)

  const flowNameRef = computed(() => optionsRef.value.flowName ?? 'assistant')
  const welcomeMessageRef = computed(
    () => optionsRef.value.welcomeMessage ?? AI_CHAT_COPY.welcomeMessage,
  )
  const enableCityContext = toValue(options).enableCityContext ?? true

  const selectedCity = useStorage('selected-city', COMMON_CONFIG.DEFAULT_CITY)

  const sessionId = ref<string>(generateSessionId())
  const messages = ref<ChatMessage[]>([])

  const resetSession = () => {
    sessionId.value = generateSessionId()
    messages.value = [
      {
        role: 'ai',
        content: welcomeMessageRef.value,
      },
    ]
  }

  // Initialize with welcome message
  resetSession()

  // Watch flowName changes and auto-reset session
  watch(flowNameRef, () => {
    resetSession()
  })

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (message: string) =>
      chatWithAI({
        flowName: flowNameRef.value,
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
        content: AI_CHAT_COPY.errorMessage,
      })
    },
  })

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isPending.value) return

    const isFirstUserMessage = !messages.value.some((m) => m.role === 'user')

    let sendContent = trimmed
    if (isFirstUserMessage && enableCityContext) {
      sendContent = buildAIChatPrompt(trimmed, selectedCity.value)
    }

    messages.value.push({ role: 'user', content: trimmed })
    sendMessage(sendContent)
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
