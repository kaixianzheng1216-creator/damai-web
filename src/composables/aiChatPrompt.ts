export function buildAIChatPrompt(message: string, selectedCity: string) {
  const trimmed = message.trim()
  const parts: string[] = []

  if (selectedCity) {
    parts.push('【系统上下文】')
    parts.push(`当前城市: ${selectedCity}`)
  }

  parts.push('【用户问题】')
  parts.push(trimmed)

  return parts.join('\n')
}
