import { afterEach, describe, expect, it, vi } from 'vitest'

async function setupProfileSection(initialSection?: string) {
  vi.resetModules()

  const { effectScope, nextTick, reactive } = await import('vue')
  const route = reactive({
    path: '/profile',
    query: initialSection ? { section: initialSection } : {},
  })
  const replace = vi.fn(async (location: { path: string; query: Record<string, unknown> }) => {
    route.path = location.path
    route.query = location.query as typeof route.query
  })

  vi.doMock('vue-router', () => ({
    useRoute: () => route,
    useRouter: () => ({ replace }),
  }))

  const { useProfileSection } = await import('../useProfileSection')
  const scope = effectScope()
  const result = scope.run(() => useProfileSection())

  if (!result) {
    throw new Error('useProfileSection did not initialize')
  }

  await nextTick()

  return {
    result,
    replace,
    cleanup: () => {
      scope.stop()
      vi.doUnmock('vue-router')
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('vue-router')
})

describe('useProfileSection', () => {
  it('syncs the active section from a valid route query', async () => {
    const harness = await setupProfileSection('orders')

    expect(harness.result.activeSection.value).toBe('orders')

    harness.cleanup()
  })

  it('keeps the default section for invalid route query values', async () => {
    const harness = await setupProfileSection('unknown')

    expect(harness.result.activeSection.value).toBe('info')

    harness.cleanup()
  })

  it('updates route query when opening a new section', async () => {
    const harness = await setupProfileSection()

    await harness.result.openSection('tickets')

    expect(harness.result.activeSection.value).toBe('tickets')
    expect(harness.replace).toHaveBeenCalledWith({
      path: '/profile',
      query: { section: 'tickets' },
    })

    harness.cleanup()
  })
})
