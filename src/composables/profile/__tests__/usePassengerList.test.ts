import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { fetchPassengerPage } from '@/api/account'
import { usePassengerList } from '../usePassengerList'
import type { PageResponsePassengerVO, PassengerVO } from '@/api/account'

vi.mock('@/api/account', () => ({
  fetchPassengerPage: vi.fn(),
}))

const createPassenger = (overrides: Partial<PassengerVO> = {}): PassengerVO => ({
  id: 'p-1',
  userId: 'user-1',
  name: '张三',
  idType: 1,
  idTypeLabel: '身份证',
  idNoMasked: '110101********0001',
  ...overrides,
})

const createPage = <T>(records: T[]): PageResponsePassengerVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

function setupPassengerList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const app = createApp({})
  let scope: EffectScope | undefined

  app.use(VueQueryPlugin, { queryClient })

  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() => usePassengerList())
  })

  if (!result) {
    throw new Error('usePassengerList did not initialize')
  }

  return {
    result,
    invalidateSpy,
    cleanup: () => {
      scope?.stop()
      queryClient.clear()
    },
  }
}

let cleanup: (() => void) | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  vi.clearAllMocks()
})

describe('usePassengerList', () => {
  it('loads passenger list with pagination', async () => {
    const passenger = createPassenger()
    vi.mocked(fetchPassengerPage).mockResolvedValue(createPage([passenger]))
    const harness = setupPassengerList()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(fetchPassengerPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        name: undefined,
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.passengerList.value).toEqual([
        {
          id: 'p-1',
          name: '张三',
          certType: '身份证',
          certNo: '110101********0001',
        },
      ])
    })
    expect(harness.result.passengerTotalRow.value).toBe(1)
    expect(harness.result.passengerTotalPages.value).toBe(1)
  })

  it('keyword filter resets page to 1', async () => {
    vi.mocked(fetchPassengerPage).mockResolvedValue(createPage([]))
    const harness = setupPassengerList()
    cleanup = harness.cleanup

    harness.result.updatePassengerPage(3)
    await nextTick()

    harness.result.updatePassengerKeyword('张三')
    await nextTick()

    expect(harness.result.passengerPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(fetchPassengerPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        name: '张三',
      })
    })
  })

  it('refreshes passenger list by invalidating queries', async () => {
    vi.mocked(fetchPassengerPage).mockResolvedValue(createPage([]))
    const harness = setupPassengerList()
    cleanup = harness.cleanup

    harness.result.refreshPassengerList()

    expect(harness.invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['passenger-list'],
    })
  })

  it('passes undefined name when keyword is empty', async () => {
    vi.mocked(fetchPassengerPage).mockResolvedValue(createPage([]))
    const harness = setupPassengerList()
    cleanup = harness.cleanup

    harness.result.updatePassengerKeyword('')
    await nextTick()

    await vi.waitFor(() => {
      expect(fetchPassengerPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        name: undefined,
      })
    })
  })
})
