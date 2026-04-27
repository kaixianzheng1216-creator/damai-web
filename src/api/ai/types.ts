export interface AiChatItem {
  id: string
  name: string
  coverUrl: string
  venueName: string
  startTime: string
  minPrice: number
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
