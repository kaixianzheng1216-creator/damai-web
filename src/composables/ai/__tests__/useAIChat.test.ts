import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope, type EffectScope } from 'vue'
import { createApp } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { useAIChat } from '../useAIChat'

const flushPromises = async () => {
  await Promise.resolve()
  await nextTick()
}

// Mock API
const mockChatWithAI = vi.fn()
vi.mock('@/api/ai', () => ({
  chatWithAI: (...args: unknown[]) => mockChatWithAI(...args),
}))

// Mock useStorage
vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((_key: string, defaultValue: unknown) => ref(defaultValue)),
}))

// Mock buildAIChatPrompt
vi.mock('@/utils/aiChatPrompt', () => ({
  buildAIChatPrompt: vi.fn((msg: string, city: string) => `${city}|${msg}`),
}))

describe('useAIChat', () => {
  let scope: EffectScope | undefined
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    scope?.stop()
  })

  function runComposable<T>(fn: () => T): T {
    const app = createApp({})
    app.use(VueQueryPlugin, { queryClient })
    return app.runWithContext(() => {
      scope = effectScope()
      return scope.run(fn)!
    })
  }

  it('initializes with default flowName and welcomeMessage', () => {
    const { messages } = runComposable(() => useAIChat())

    expect(messages.value).toHaveLength(1)
    expect(messages.value[0].role).toBe('ai')
    expect(messages.value[0].content).toContain('Damai 智能助手')
  })

  it('initializes with custom flowName and welcomeMessage', () => {
    const { messages } = runComposable(() =>
      useAIChat({
        flowName: 'support',
        welcomeMessage: '客服欢迎语',
      }),
    )

    expect(messages.value).toHaveLength(1)
    expect(messages.value[0].content).toBe('客服欢迎语')
  })

  it('accepts reactive options and resets session when flowName changes', async () => {
    const options = ref({
      flowName: 'assistant',
      welcomeMessage: '助手欢迎语',
    })

    const { messages } = runComposable(() => useAIChat(options))

    // Initial state
    expect(messages.value).toHaveLength(1)
    expect(messages.value[0].content).toBe('助手欢迎语')

    // Change flowName
    options.value = {
      flowName: 'support',
      welcomeMessage: '客服欢迎语',
    }

    await flushPromises()

    // Should reset session with new welcomeMessage
    expect(messages.value).toHaveLength(1)
    expect(messages.value[0].content).toBe('客服欢迎语')
  })

  it('sends correct flowName in API request', async () => {
    mockChatWithAI.mockResolvedValue({
      message: 'AI回复',
      items: [],
      suggestions: [],
    })

    const options = ref({
      flowName: 'support',
      welcomeMessage: '客服欢迎语',
      enableCityContext: false,
    })

    const { submit } = runComposable(() => useAIChat(options))

    submit('查询订单')

    await vi.waitFor(() => {
      expect(mockChatWithAI).toHaveBeenCalledTimes(1)
    })

    const callArg = mockChatWithAI.mock.calls[0][0]
    expect(callArg).toMatchObject({
      flowName: 'support',
      message: '查询订单',
    })
  })

  it('updates flowName in subsequent API calls after mode switch', async () => {
    mockChatWithAI.mockResolvedValue({
      message: 'AI回复',
      items: [],
      suggestions: [],
    })

    const options = ref({
      flowName: 'assistant',
      welcomeMessage: '助手欢迎语',
      enableCityContext: false,
    })

    const { submit } = runComposable(() => useAIChat(options))

    // First message as assistant
    submit('北京演唱会')

    await vi.waitFor(() => {
      expect(mockChatWithAI).toHaveBeenCalledTimes(1)
    })

    const firstCall = mockChatWithAI.mock.calls[0][0]
    expect(firstCall.flowName).toBe('assistant')

    // Switch to support mode
    options.value = {
      flowName: 'support',
      welcomeMessage: '客服欢迎语',
      enableCityContext: false,
    }
    await flushPromises()

    // Send message as support
    submit('查询订单')

    await vi.waitFor(() => {
      expect(mockChatWithAI).toHaveBeenCalledTimes(2)
    })

    const secondCall = mockChatWithAI.mock.calls[1][0]
    expect(secondCall.flowName).toBe('support')
  })

  it('preserves user messages and adds AI response on success', async () => {
    mockChatWithAI.mockResolvedValue({
      message: '找到了！',
      items: [
        {
          type: 'event',
          id: '1',
          name: '测试活动',
          coverUrl: 'https://example.com/cover.jpg',
          participantName: '测试艺人',
          cityNameSnapshot: '北京',
          venueNameSnapshot: '测试场馆',
          firstSessionStartAt: '2026-05-01T19:30:00',
          lastSessionEndAt: '2026-05-01T22:00:00',
          minPrice: 12800,
          maxPrice: 28000,
        },
      ],
      suggestions: ['更多推荐'],
    })

    const { messages, submit } = runComposable(() => useAIChat({ enableCityContext: false }))

    submit('测试消息')

    await vi.waitFor(() => {
      expect(messages.value).toHaveLength(3)
    })

    expect(messages.value[1].role).toBe('user')
    expect(messages.value[1].content).toBe('测试消息')
    expect(messages.value[2].role).toBe('ai')
    expect(messages.value[2].content).toBe('找到了！')
    expect(messages.value[2].items).toHaveLength(1)
    expect(messages.value[2].suggestions).toEqual(['更多推荐'])
  })

  it('shows error message on API failure', async () => {
    mockChatWithAI.mockRejectedValue(new Error('Network error'))

    const { messages, submit } = runComposable(() => useAIChat({ enableCityContext: false }))

    submit('测试消息')

    await vi.waitFor(() => {
      expect(messages.value).toHaveLength(3)
    })

    expect(messages.value[2].role).toBe('ai')
    expect(messages.value[2].content).toBe('抱歉，服务暂时不可用，请稍后再试。')
  })

  it('computes lastSuggestions from the most recent AI message', async () => {
    mockChatWithAI.mockResolvedValue({
      message: '回复1',
      items: [],
      suggestions: ['建议1', '建议2'],
    })

    const { submit, lastSuggestions } = runComposable(() => useAIChat({ enableCityContext: false }))

    expect(lastSuggestions.value).toEqual([])

    submit('测试')

    await vi.waitFor(() => {
      expect(lastSuggestions.value).toEqual(['建议1', '建议2'])
    })
  })
})
