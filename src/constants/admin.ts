export const ADMIN_AUTH_COPY = {
  title: '大麦票务 · 管理后台',
  subtitle: '管理员登录',
  mobilePlaceholder: '请输入管理员手机号',
  codePlaceholder: '请输入 6 位验证码',
  loginButton: '登录',
  sendCodeButton: '获取验证码',
  testCredentials: import.meta.env.DEV ? '测试账号：13800000001 / 000000' : '',
}

export const USER_STATUS = {
  NORMAL: 1,
  BANNED: 0,
} as const
