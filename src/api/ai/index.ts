import { request } from '@/api/request'
import type { AiChatResponse } from './types'

export interface ChatParams {
  flowName: string
  message: string
  sessionId: string
}

/** AI 聊天接口超时时间（毫秒），LLM 生成响应较慢，需单独设置较长的超时 */
const AI_CHAT_TIMEOUT_MS = 60000

export const chatWithAI = (params: ChatParams): Promise<AiChatResponse> => {
  return request.get('/api/ai/front/ai/chat', { params, timeout: AI_CHAT_TIMEOUT_MS })
}
