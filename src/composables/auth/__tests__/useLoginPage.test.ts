import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, type EffectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  testQueryClient = queryClient
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
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
      queryClient.clear()
    },
  }
}

let cleanup: (() => void) | undefined
let testQueryClient: QueryClient | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  testQueryClient?.clear()
  testQueryClient = undefined
  vi.clearAllMocks()
  vi.useRealTimers()
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
    await flushPromises()
    expect(sendVerifyCode).toHaveBeenCalledWith({
      mobile: '13800138000',
      accountType: 'user',
    })

    await harness.result.handleLogin()
    await flushPromises()

    expect(login).toHaveBeenCalledWith({
      mobile: '13800138000',
      code: '123456',
      accountType: 'user',
    })
    expect(harness.saveSession).toHaveBeenCalledWith(response)
    expect(routerMocks.push).toHaveBeenCalledWith('/profile')
  })

  it('displays error when login fails (invalid code / server error)', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid code'))
    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '13800138000'
    harness.result.form.code = '000000'

    await harness.result.handleLogin()
    await flushPromises()

    expect(harness.result.errorMsg.value).toBe(AUTH_COPY.loginFailed)
    expect(harness.saveSession).not.toHaveBeenCalled()
    expect(routerMocks.push).not.toHaveBeenCalled()
  })

  it('resets isLoading to false after login failure', async () => {
    vi.mocked(login).mockRejectedValue(new Error('500 Internal Server Error'))
    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '13800138000'
    harness.result.form.code = '123456'

    await harness.result.handleLogin()
    await flushPromises()

    expect(harness.result.errorMsg.value).toBe(AUTH_COPY.loginFailed)
    expect(harness.result.isLoading.value).toBe(false)
  })

  it('displays error when send-code fails and allows retry', async () => {
    vi.mocked(sendVerifyCode).mockRejectedValue(new Error('Network error'))
    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '13800138000'
    await harness.result.handleSendCode()
    await flushPromises()

    expect(harness.result.errorMsg.value).toBe(AUTH_COPY.sendCodeFailed)
    expect(harness.result.isSendingCode.value).toBe(false)

    // User can retry — mock success this time
    vi.mocked(sendVerifyCode).mockResolvedValue(undefined)
    harness.result.errorMsg.value = ''
    await harness.result.handleSendCode()
    await flushPromises()

    expect(sendVerifyCode).toHaveBeenCalledTimes(2)
    expect(harness.result.errorMsg.value).toBe('')
  })

  it('sets isLoading true during login and false after completion', async () => {
    let resolveLogin!: (value: LoginResponse) => void
    const loginPromise = new Promise<LoginResponse>((resolve) => {
      resolveLogin = resolve
    })
    vi.mocked(login).mockReturnValue(loginPromise)

    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '13800138000'
    harness.result.form.code = '123456'

    const loginCall = harness.result.handleLogin()
    await flushPromises()

    // isLoading should be true while login is pending
    expect(harness.result.isLoading.value).toBe(true)

    // Resolve the login
    resolveLogin(createLoginResponse())
    await loginCall
    await flushPromises()

    expect(harness.result.isLoading.value).toBe(false)
  })

  it('runs countdown after send-code and blocks resend until 0', async () => {
    vi.useFakeTimers()

    vi.mocked(sendVerifyCode).mockResolvedValue(undefined)

    const harness = setupLoginPage()
    cleanup = harness.cleanup

    harness.result.form.mobile = '13800138000'
    await harness.result.handleSendCode()
    await flushPromises()

    expect(harness.result.isCountdownRunning.value).toBe(true)
    expect(sendVerifyCode).toHaveBeenCalledTimes(1)

    // Resend blocked while countdown active
    await harness.result.handleSendCode()
    expect(sendVerifyCode).toHaveBeenCalledTimes(1)

    // Advance time: countdown goes from 60 to 30
    vi.advanceTimersByTime(30_000)
    expect(harness.result.countdownText.value).toContain('30')
    expect(harness.result.isCountdownRunning.value).toBe(true)

    // Still blocked mid-countdown
    await harness.result.handleSendCode()
    expect(sendVerifyCode).toHaveBeenCalledTimes(1)

    // Advance past countdown end (remaining ~30 seconds)
    vi.advanceTimersByTime(31_000)

    expect(harness.result.isCountdownRunning.value).toBe(false)
    expect(harness.result.countdownText.value).toBe(AUTH_COPY.sendCode)

    // Resend now works
    await harness.result.handleSendCode()
    expect(sendVerifyCode).toHaveBeenCalledTimes(2)
  })
})
