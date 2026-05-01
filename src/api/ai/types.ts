export interface AiChatEventItem {
  type: 'event'
  id: string
  name: string
  coverUrl?: string
  participantName?: string
  cityNameSnapshot?: string
  venueNameSnapshot?: string
  firstSessionStartAt?: string
  lastSessionEndAt?: string
  minPrice: number
  maxPrice: number
}

export interface AiChatOrderItem {
  type: 'order'
  id: string
  eventNameSnapshot: string
  eventCoverUrlSnapshot?: string
  venueNameSnapshot?: string
  sessionStartAtSnapshot?: string
  totalAmount: number
  quantity: number
  status: number
  statusLabel: string
  orderNo: string
}

export interface AiChatTicketItem {
  type: 'ticket'
  id: string
  eventNameSnapshot: string
  eventCoverUrlSnapshot?: string
  venueNameSnapshot?: string
  sessionStartAtSnapshot?: string
  passengerNameSnapshot?: string
  status: number
  statusLabel: string
  ticketNo: string
}

export type AiChatItem = AiChatEventItem | AiChatOrderItem | AiChatTicketItem

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
