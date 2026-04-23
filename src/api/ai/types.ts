export interface AiChatItem {
  id: string
  name: string
  cover_url: string
  venue_name: string
  start_time: string
  min_price: number
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
