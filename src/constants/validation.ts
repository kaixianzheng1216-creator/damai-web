export const VALIDATION_PATTERNS = {
  MOBILE: /^1[3-9]\d{9}$/,
  CODE: /^\d{6}$/,
  ID_CARD: /^\d{17}[\dXx]$/,
} as const
