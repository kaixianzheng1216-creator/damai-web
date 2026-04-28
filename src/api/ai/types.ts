export interface AiChatItem {
  type: string
  id: string
  title: string
  subtitle: string
  coverUrl: string
  status: string
  amount: number
  time: string
}

export interface AiChatRequest {
  flowName: string
  message: string
  sessionId: string
}

export interface AiChatResponse {
  message: string
  items: AiChatItem[]
  suggestions: string[]
}

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  items?: AiChatItem[]
  suggestions?: string[]
}
