import { describe, expect, it } from 'vitest'
import { buildAIChatPrompt } from '../aiChatPrompt'

describe('AI chat prompt context', () => {
  it('keeps first-message context limited to city and the user question', () => {
    const prompt = buildAIChatPrompt('  最近有什么演唱会？  ', '北京')

    expect(prompt).toContain('当前城市: 北京')
    expect(prompt).toContain('最近有什么演唱会？')
    expect(prompt).not.toContain('用户名')
    expect(prompt).not.toContain('手机号')
  })

  it('omits context block when no city is available', () => {
    expect(buildAIChatPrompt('推荐话剧', '')).toBe('【用户问题】\n推荐话剧')
  })
})
