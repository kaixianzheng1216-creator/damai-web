import { request } from '@/api/request'
import type { AiChatRequest, AiChatResponse } from './types'

/** AI 聊天接口超时时间（毫秒），LLM 生成响应较慢，需单独设置较长的超时 */
const AI_CHAT_TIMEOUT_MS = 60000

export const chatWithAI = (data: AiChatRequest): Promise<AiChatResponse> => {
  return request.post('/api/ai/front/ai/chat', data, { timeout: AI_CHAT_TIMEOUT_MS })
}
