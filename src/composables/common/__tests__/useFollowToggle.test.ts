import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin, type QueryKey } from '@tanstack/vue-query'
import { useFollowToggle } from '../useFollowToggle'

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
}))

const userState = vi.hoisted<{ isLoggedIn: boolean }>(() => ({
  isLoggedIn: false,
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/test-path' }),
  useRouter: () => ({ push: mocks.routerPush }),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => userState,
}))

const flushPromises = async () => {
  await Promise.resolve()
  await nextTick()
}

interface SetupOptions {
  isLoggedIn?: boolean
  checkIsFollowed?: () => Promise<boolean>
  follow?: (...args: unknown[]) => Promise<void>
  unfollow?: (...args: unknown[]) => Promise<void>
  buildFollowRequest?: (id: string) => unknown
}

function setupUseFollowToggle(options: SetupOptions = {}) {
  userState.isLoggedIn = options.isLoggedIn ?? false
  mocks.routerPush.mockReset()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const setDataSpy = vi.spyOn(queryClient, 'setQueryData')

  const app = createApp({})
  let scope: EffectScope | undefined

  app.use(VueQueryPlugin, { queryClient })

  const defaultCheckIsFollowed = vi.fn().mockResolvedValue(false)
  const defaultFollow = vi.fn().mockResolvedValue(undefined)
  const defaultUnfollow = vi.fn().mockResolvedValue(undefined)

  const checkIsFollowed = options.checkIsFollowed ?? defaultCheckIsFollowed
  const follow = options.follow ?? defaultFollow
  const unfollow = options.unfollow ?? defaultUnfollow
  const buildFollowRequest = options.buildFollowRequest ?? ((id: string) => ({ id }))

  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() =>
      useFollowToggle({
        id: () => 'test-1',
        followQueryKey: (id) => ['follow', id] as QueryKey,
        entityQueryKey: (id) => ['entity', id] as QueryKey,
        checkIsFollowed: checkIsFollowed as unknown as Parameters<
          typeof useFollowToggle
        >[0]['checkIsFollowed'],
        follow: follow as unknown as Parameters<typeof useFollowToggle>[0]['follow'],
        unfollow: unfollow as unknown as Parameters<typeof useFollowToggle>[0]['unfollow'],
        buildFollowRequest: buildFollowRequest as unknown as Parameters<
          typeof useFollowToggle
        >[0]['buildFollowRequest'],
      }),
    )
  })

  if (!result) throw new Error('useFollowToggle did not initialize')

  return {
    result,
    queryClient,
    invalidateSpy,
    setDataSpy,
    checkIsFollowed,
    follow,
    unfollow,
    buildFollowRequest,
    cleanup: () => {
      scope?.stop()
      queryClient.clear()
    },
  }
}

describe('useFollowToggle', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    cleanup?.()
    cleanup = undefined
  })

  describe('isFollowed', () => {
    it('returns false when query data is undefined', () => {
      const harness = setupUseFollowToggle({ isLoggedIn: true })
      cleanup = harness.cleanup
      // Query hasn't resolved yet — data is undefined, defaults to false
      expect(harness.result.isFollowed.value).toBe(false)
    })

    it('returns false when query data is false (not followed)', async () => {
      const harness = setupUseFollowToggle({
        isLoggedIn: true,
        checkIsFollowed: vi.fn().mockResolvedValue(false),
      })
      cleanup = harness.cleanup
      await flushPromises()
      expect(harness.result.isFollowed.value).toBe(false)
    })

    it('returns true when query data is true (already followed)', async () => {
      const harness = setupUseFollowToggle({
        isLoggedIn: true,
        checkIsFollowed: vi.fn().mockResolvedValue(true),
      })
      cleanup = harness.cleanup
      await flushPromises()
      expect(harness.result.isFollowed.value).toBe(true)
    })
  })

  describe('isFollowLoading', () => {
    it('returns true when follow mutation is pending', () => {
      const harness = setupUseFollowToggle({ isLoggedIn: true })
      cleanup = harness.cleanup
      // Call mutate without awaiting — mutation stays pending
      harness.result.followMutation.mutate({ id: 'test-1' })
      expect(harness.result.isFollowLoading.value).toBe(true)
    })

    it('returns true when unfollow mutation is pending', () => {
      const harness = setupUseFollowToggle({ isLoggedIn: true })
      cleanup = harness.cleanup
      harness.result.unfollowMutation.mutate('test-1')
      expect(harness.result.isFollowLoading.value).toBe(true)
    })
  })

  describe('toggleFollow', () => {
    it('when logged out, pushes to login route and makes no API call', async () => {
      const harness = setupUseFollowToggle({ isLoggedIn: false })
      cleanup = harness.cleanup

      await harness.result.toggleFollow()

      expect(mocks.routerPush).toHaveBeenCalledWith({
        name: 'login',
        query: { redirect: '/test-path' },
      })
      expect(harness.follow).not.toHaveBeenCalled()
      expect(harness.unfollow).not.toHaveBeenCalled()
    })

    it('when logged in and not followed, calls follow mutation', async () => {
      const harness = setupUseFollowToggle({
        isLoggedIn: true,
        checkIsFollowed: vi.fn().mockResolvedValue(false),
      })
      cleanup = harness.cleanup
      await flushPromises()

      await harness.result.toggleFollow()
      await flushPromises()

      expect(harness.follow).toHaveBeenCalledWith({ id: 'test-1' }, expect.anything())
      expect(harness.unfollow).not.toHaveBeenCalled()
    })

    it('when logged in and already followed, calls unfollow mutation', async () => {
      const harness = setupUseFollowToggle({
        isLoggedIn: true,
        checkIsFollowed: vi.fn().mockResolvedValue(true),
      })
      cleanup = harness.cleanup
      await flushPromises()

      await harness.result.toggleFollow()
      await flushPromises()

      expect(harness.unfollow).toHaveBeenCalledWith('test-1', expect.anything())
      expect(harness.follow).not.toHaveBeenCalled()
    })
  })

  describe('follow mutation onSuccess', () => {
    it('sets followQueryKey data to true and invalidates entityQueryKey', async () => {
      const harness = setupUseFollowToggle({
        isLoggedIn: true,
        checkIsFollowed: vi.fn().mockResolvedValue(false),
      })
      cleanup = harness.cleanup
      await flushPromises()

      await harness.result.followMutation.mutateAsync({ id: 'test-1' })
      await flushPromises()

      expect(harness.setDataSpy).toHaveBeenCalledWith(['follow', 'test-1'], true)
      expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['entity', 'test-1'] })
    })
  })

  describe('unfollow mutation onSuccess', () => {
    it('sets followQueryKey data to false and invalidates entityQueryKey', async () => {
      const harness = setupUseFollowToggle({
        isLoggedIn: true,
        checkIsFollowed: vi.fn().mockResolvedValue(true),
      })
      cleanup = harness.cleanup
      await flushPromises()

      await harness.result.unfollowMutation.mutateAsync('test-1')
      await flushPromises()

      expect(harness.setDataSpy).toHaveBeenCalledWith(['follow', 'test-1'], false)
      expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['entity', 'test-1'] })
    })
  })
})
