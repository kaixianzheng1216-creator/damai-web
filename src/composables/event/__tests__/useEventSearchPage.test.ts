import { afterEach, describe, expect, it, vi } from 'vitest'
import type { EffectScope } from 'vue'
import type { EventVO, PageResponseEventVO } from '@/api/event'

const createEvent = (id: string): EventVO => ({
  id,
  categoryId: 'child-1',
  venueId: 'venue-1',
  cityId: 'city-1',
  name: `Event ${id}`,
  coverUrl: 'cover.png',
  status: 1,
})

const createPage = (records: EventVO[] = [createEvent('event-1')]): PageResponseEventVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 3,
  records,
})

async function setupEventSearch(initialQuery: Record<string, unknown> = {}) {
  vi.resetModules()

  const { createApp, effectScope, nextTick, reactive } = await import('vue')
  const { QueryClient, VueQueryPlugin } = await import('@tanstack/vue-query')

  const route = reactive({
    path: '/category',
    query: { ...initialQuery },
  })
  const push = vi.fn(async (location: { name: string; query: Record<string, unknown> }) => {
    route.query = { ...location.query }
  })

  vi.doMock('vue-router', () => ({
    useRoute: () => route,
    useRouter: () => ({ push }),
  }))

  vi.doMock('@/api/event', () => ({
    fetchEventPage: vi.fn().mockResolvedValue(createPage()),
    fetchCitiesList: vi.fn().mockResolvedValue([
      {
        id: 'city-1',
        name: '北京',
        pinyin: 'beijing',
        firstLetter: 'B',
        isFeatured: 1,
      },
    ]),
    fetchCategories: vi.fn().mockResolvedValue([
      {
        id: 'parent-1',
        parentId: '0',
        name: '演唱会',
        sortOrder: 1,
        children: [{ id: 'child-1', parentId: 'parent-1', name: '流行', sortOrder: 1 }],
      },
    ]),
  }))

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const app = createApp({})
  let scope: EffectScope | undefined

  app.use(VueQueryPlugin, { queryClient })

  const { useEventSearchPage } = await import('../useEventSearchPage')
  const api = await import('@/api/event')
  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() => useEventSearchPage())
  })

  if (!result) {
    throw new Error('useEventSearchPage did not initialize')
  }

  const flush = async () => {
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
    await nextTick()
  }

  await flush()

  return {
    result,
    route,
    push,
    api,
    cleanup: () => {
      scope?.stop()
      queryClient.clear()
      vi.doUnmock('vue-router')
      vi.doUnmock('@/api/event')
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('vue-router')
  vi.doUnmock('@/api/event')
})

describe('useEventSearchPage', () => {
  it('normalizes URL query and syncs a child category to its parent', async () => {
    const harness = await setupEventSearch({
      keyword: 'live',
      categoryId: 'child-1',
      timeType: '4',
      date: '2026-05-01',
      sortType: '1',
      page: '2',
    })

    expect(harness.result.queryParams.value).toMatchObject({
      name: 'live',
      categoryId: 'child-1',
      timeType: 4,
      date: '2026-05-01',
      sortType: 1,
      page: 2,
    })
    expect(harness.result.selectedParentCategoryId.value).toBe('parent-1')
    expect(harness.result.cityOptions.value).toContainEqual({ label: '北京', value: 'city-1' })
    expect(harness.result.childCategoryOptions.value).toEqual([
      { label: '全部', value: 'parent-1' },
      { label: '流行', value: 'child-1' },
    ])
    expect(harness.result.searchRecords.value).toHaveLength(1)
    expect(harness.result.totalRow.value).toBe(1)
    expect(harness.api.fetchEventPage).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'child-1', page: 2 }),
    )

    harness.cleanup()
  })

  it('pushes one query update for sort, parent category, calendar date and valid page changes', async () => {
    const harness = await setupEventSearch({ keyword: 'live', page: '2' })

    await harness.result.handleSortChange(2)
    expect(harness.push).toHaveBeenLastCalledWith({
      name: 'category',
      query: expect.objectContaining({
        keyword: 'live',
        sortType: '2',
        sortField: 'createdAt',
        sortOrder: 'desc',
        page: '1',
      }),
    })

    await harness.result.handleParentCategoryChange('parent-1')
    expect(harness.result.selectedParentCategoryId.value).toBe('parent-1')
    expect(harness.push).toHaveBeenLastCalledWith({
      name: 'category',
      query: expect.objectContaining({ categoryId: 'parent-1', page: '1' }),
    })

    await harness.result.handleCalendarDateChange('2026-05-03')
    expect(harness.push).toHaveBeenLastCalledWith({
      name: 'category',
      query: expect.objectContaining({
        timeType: '4',
        date: '2026-05-03',
        page: '1',
      }),
    })

    await harness.result.handlePageChange(3)
    expect(harness.push).toHaveBeenLastCalledWith({
      name: 'category',
      query: expect.objectContaining({ page: '3' }),
    })

    await harness.result.handlePageChange(4)
    expect(harness.push).not.toHaveBeenLastCalledWith({
      name: 'category',
      query: expect.objectContaining({ page: '4' }),
    })

    harness.cleanup()
  })
})
