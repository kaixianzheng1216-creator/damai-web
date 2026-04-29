import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, type EffectScope } from 'vue'
import { login, sendVerifyCode, type LoginResponse } from '@/api/account'
import { AUTH_COPY } from '@/constants'
import { useLoginPage } from '../useLoginPage'

const routerMocks = vi.hoisted(() => ({
  currentRoute: { value: { query: { redirect: '/profile' } } },
  push: vi.fn(),
}))

vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    push: vi.fn(),
  })),
  createWebHistory: vi.fn(),
  useRouter: () => routerMocks,
}))

vi.mock('@/api/account', () => ({
  sendVerifyCode: vi.fn(),
  login: vi.fn(),
}))

const createLoginResponse = (): LoginResponse => ({
  token: 'token',
  user: {
    id: 'user-1',
    username: '小麦',
    mobile: '13800138000',
    avatarUrl: '',
    status: 1,
    statusLabel: '正常',
  },
})

function setupLoginPage(saveSession = vi.fn()) {
  const app = createApp({})
  let scope: EffectScope | undefined

  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() =>
      useLoginPage({
        accountType: 'user',
        sendCodeText: AUTH_COPY.sendCode,
        resendCodeText: (seconds) => `${seconds}s ${AUTH_COPY.resendCodeSuffix}`,
        saveSession,
        resolveRedirect: (route) => {
          const redirect = route.query.redirect
          return typeof redirect === 'string' ? redirect : '/'
        },
      }),
    )
  })

  if (!result) {
    throw new Error('useLoginPage did not initialize')
  }

  return {
    result,
    saveSession,
    cleanup: () => {
      scope?.stop()
    },
  }
}

let cleanup: (() => void) | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  vi.clearAllMocks()
  routerMocks.currentRoute.value.query = { redirect: '/profile' }
})

describe('useLoginPage', () => {
  it('validates mobile before sending a login code', async () => {
    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '123'
    await harness.result.handleSendCode()

    expect(sendVerifyCode).not.toHaveBeenCalled()
    expect(harness.result.errorMsg.value).toBe(AUTH_COPY.mobileRequired)
  })

  it('sends codes, logs in, saves the session, and redirects', async () => {
    const response = createLoginResponse()
    vi.mocked(sendVerifyCode).mockResolvedValue(undefined)
    vi.mocked(login).mockResolvedValue(response)
    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '13800138000'
    harness.result.form.code = '123456'

    await harness.result.handleSendCode()
    expect(sendVerifyCode).toHaveBeenCalledWith({
      mobile: '13800138000',
      accountType: 'user',
    })

    await harness.result.handleLogin()

    expect(login).toHaveBeenCalledWith({
      mobile: '13800138000',
      code: '123456',
      accountType: 'user',
    })
    expect(harness.saveSession).toHaveBeenCalledWith(response)
    expect(routerMocks.push).toHaveBeenCalledWith('/profile')
  })
})
