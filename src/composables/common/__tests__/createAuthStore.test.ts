import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, effectScope, nextTick, type App, type EffectScope } from 'vue'
import { createAuthStore } from '@/composables/common/createAuthStore'

const TOKEN_KEY = 'test-token-key'
const INFO_KEY = 'test-info-key'

interface TestInfo {
  id: string
  name: string
}

describe('createAuthStore', () => {
  let app: App
  let scope: EffectScope

  beforeEach(() => {
    localStorage.clear()
    app = createApp({})
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
    app.unmount()
    localStorage.clear()
  })

  const runAuthStore = <T>(tokenKey: string, infoKey: string) => {
    return app.runWithContext(() => scope.run(() => createAuthStore<T>(tokenKey, infoKey))!)
  }

  it('initializes token and info as null', () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    expect(store.token.value).toBeNull()
    expect(store.info.value).toBeNull()
  })

  it('isLoggedIn returns false when token is null', () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    expect(store.isLoggedIn.value).toBe(false)
  })

  it('isLoggedIn returns true when token is set to a non-empty string', () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    store.token.value = 'abc123'

    expect(store.isLoggedIn.value).toBe(true)
  })

  it('isLoggedIn returns false when token is set to empty string', () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    store.token.value = ''

    expect(store.isLoggedIn.value).toBe(false)
  })

  it('persists token to localStorage', async () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    store.token.value = 'abc123'
    await nextTick()

    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc123')
  })

  it('persists info to localStorage', async () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)
    const testInfo: TestInfo = { id: '1', name: 'test' }

    store.info.value = testInfo
    await nextTick()

    expect(localStorage.getItem(INFO_KEY)).toBe(String(testInfo))
  })

  it('clears token from localStorage when set to null', async () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    store.token.value = 'abc123'
    await nextTick()
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc123')

    store.token.value = null
    await nextTick()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('clears info from localStorage when set to null', async () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)
    const testInfo: TestInfo = { id: '1', name: 'test' }

    store.info.value = testInfo
    await nextTick()
    expect(localStorage.getItem(INFO_KEY)).not.toBeNull()

    store.info.value = null
    await nextTick()

    expect(localStorage.getItem(INFO_KEY)).toBeNull()
  })

  it('reads persisted token on recreation with same keys', async () => {
    const store1 = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)
    store1.token.value = 'persisted-token'
    await nextTick()
    scope.stop()

    const scope2 = effectScope()
    const store2 = scope2.run(() => createAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY))!

    expect(store2.token.value).toBe('persisted-token')
    expect(store2.isLoggedIn.value).toBe(true)

    scope2.stop()
  })

  it('supports multiple independent stores with different keys', async () => {
    const storeA = runAuthStore<TestInfo>('token-a', 'info-a')
    const storeB = runAuthStore<TestInfo>('token-b', 'info-b')

    storeA.token.value = 'token-a-val'
    storeB.token.value = 'token-b-val'
    await nextTick()

    expect(storeA.token.value).toBe('token-a-val')
    expect(storeB.token.value).toBe('token-b-val')
    expect(localStorage.getItem('token-a')).toBe('token-a-val')
    expect(localStorage.getItem('token-b')).toBe('token-b-val')
  })

  it('isLoggedIn reacts to token changes', () => {
    const store = runAuthStore<TestInfo>(TOKEN_KEY, INFO_KEY)

    expect(store.isLoggedIn.value).toBe(false)

    store.token.value = 'token1'
    expect(store.isLoggedIn.value).toBe(true)

    store.token.value = 'token2'
    expect(store.isLoggedIn.value).toBe(true)

    store.token.value = null
    expect(store.isLoggedIn.value).toBe(false)

    store.token.value = 'token3'
    expect(store.isLoggedIn.value).toBe(true)
  })
})
