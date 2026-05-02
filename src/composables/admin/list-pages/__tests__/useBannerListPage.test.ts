import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createBanner, deleteBanner, fetchAdminBanners, updateBanner } from '@/api/event/banner'
import { fetchAdminCities } from '@/api/event/city'
import { useBannerListPage } from '../useBannerListPage'
import type { BannerVO, PageResponseBannerVO } from '@/api/event'

vi.mock('@/api/event/banner', () => ({
  fetchAdminBanners: vi.fn(),
  createBanner: vi.fn(),
  updateBanner: vi.fn(),
  deleteBanner: vi.fn(),
}))

vi.mock('@/api/event/city', () => ({
  fetchAdminCities: vi.fn(),
}))

const createBannerVO = (overrides: Partial<BannerVO> = {}): BannerVO => ({
  id: 'banner-1',
  cityId: 'city-1',
  title: '测试 Banner',
  imageUrl: 'https://example.com/image.png',
  mobileImageUrl: 'https://example.com/mobile.png',
  jumpUrl: 'https://example.com',
  sortOrder: 0,
  displayStartAt: '2026-05-01T00:00:00.000Z',
  displayEndAt: '2026-05-31T23:59:59.000Z',
  ...overrides,
})

const createPage = <T>(records: T[]): PageResponseBannerVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

function setupBannerListPage() {
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
    return scope.run(() => useBannerListPage())
  })

  if (!result) {
    throw new Error('useBannerListPage did not initialize')
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

describe('useBannerListPage', () => {
  it('loads banners with pagination and city filter', async () => {
    const banner = createBannerVO()
    vi.mocked(fetchAdminCities).mockResolvedValue([
      { id: 'city-1', name: '北京', pinyin: 'beijing', firstLetter: 'B', isFeatured: 1 },
    ])
    vi.mocked(fetchAdminBanners).mockResolvedValue(createPage([banner]))
    const harness = setupBannerListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(fetchAdminBanners).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        title: undefined,
        cityId: undefined,
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.list.value).toEqual([banner])
    })
    expect(harness.result.totalRow.value).toBe(1)
    expect(harness.result.totalPages.value).toBe(1)
    expect(harness.result.citiesData.value).toEqual([
      { id: 'city-1', name: '北京', pinyin: 'beijing', firstLetter: 'B', isFeatured: 1 },
    ])
  })

  it('resets page to 1 when search filters change', async () => {
    vi.mocked(fetchAdminCities).mockResolvedValue([])
    vi.mocked(fetchAdminBanners).mockResolvedValue(createPage([]))
    const harness = setupBannerListPage()
    cleanup = harness.cleanup

    harness.result.currentPage.value = 3
    await nextTick()

    harness.result.searchTitle.value = '测试'
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(fetchAdminBanners).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        title: '测试',
        cityId: undefined,
      })
    })

    harness.result.searchCityId.value = 'city-1'
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(fetchAdminBanners).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        title: '测试',
        cityId: 'city-1',
      })
    })
  })

  it('creates a banner, invalidates list, and closes dialog', async () => {
    vi.mocked(fetchAdminCities).mockResolvedValue([])
    vi.mocked(fetchAdminBanners).mockResolvedValue(createPage([]))
    vi.mocked(createBanner).mockResolvedValue('banner-2')
    const harness = setupBannerListPage()
    cleanup = harness.cleanup

    harness.result.openCreate()
    expect(harness.result.showDialog.value).toBe(true)
    expect(harness.result.dialogTitle.value).toBe('新建 Banner')

    harness.result.form.title = '新 Banner'
    harness.result.form.cityId = 'city-1'
    harness.result.form.imageUrl = 'https://example.com/img.png'
    harness.result.form.mobileImageUrl = 'https://example.com/m.png'
    harness.result.form.jumpUrl = 'https://example.com'
    harness.result.form.displayStartAt = '2026-06-01T00:00'
    harness.result.form.displayEndAt = '2026-06-30T23:59'
    harness.result.form.sortOrder = 1

    await harness.result.handleSubmit()

    expect(createBanner).toHaveBeenCalledWith({
      cityId: 'city-1',
      title: '新 Banner',
      imageUrl: 'https://example.com/img.png',
      mobileImageUrl: 'https://example.com/m.png',
      jumpUrl: 'https://example.com',
      displayStartAt: '2026-06-01T00:00',
      displayEndAt: '2026-06-30T23:59',
      sortOrder: 1,
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-banners'] })
    expect(harness.result.showDialog.value).toBe(false)
  })

  it('edits a banner, invalidates list, and closes dialog', async () => {
    const banner = createBannerVO()
    vi.mocked(fetchAdminCities).mockResolvedValue([])
    vi.mocked(fetchAdminBanners).mockResolvedValue(createPage([banner]))
    vi.mocked(updateBanner).mockResolvedValue(undefined)
    const harness = setupBannerListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchAdminBanners).toHaveBeenCalled())

    harness.result.openEdit(banner)
    expect(harness.result.showDialog.value).toBe(true)
    expect(harness.result.dialogTitle.value).toBe('编辑 Banner')
    expect(harness.result.editingId.value).toBe('banner-1')

    harness.result.form.title = '更新的 Banner'
    await harness.result.handleSubmit()

    expect(updateBanner).toHaveBeenCalledWith(
      'banner-1',
      expect.objectContaining({
        cityId: 'city-1',
        title: '更新的 Banner',
        imageUrl: 'https://example.com/image.png',
        mobileImageUrl: 'https://example.com/mobile.png',
        jumpUrl: 'https://example.com',
        sortOrder: 0,
      }),
    )
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-banners'] })
    expect(harness.result.showDialog.value).toBe(false)
  })

  it('does not create a banner when required fields are missing', async () => {
    vi.mocked(fetchAdminCities).mockResolvedValue([])
    vi.mocked(fetchAdminBanners).mockResolvedValue(createPage([]))
    const harness = setupBannerListPage()
    cleanup = harness.cleanup

    harness.result.openCreate()
    harness.result.form.title = '不完整'
    // Missing other required fields

    await harness.result.handleSubmit()

    expect(createBanner).not.toHaveBeenCalled()
    expect(harness.result.showDialog.value).toBe(true)
  })

  it('confirms and deletes a banner', async () => {
    const banner = createBannerVO()
    vi.mocked(fetchAdminCities).mockResolvedValue([])
    vi.mocked(fetchAdminBanners).mockResolvedValue(createPage([banner]))
    vi.mocked(deleteBanner).mockResolvedValue(undefined)
    const harness = setupBannerListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchAdminBanners).toHaveBeenCalled())

    harness.result.handleDelete(banner)
    expect(harness.result.confirmDialog.value.open).toBe(true)
    expect(harness.result.confirmDialog.value.title).toBe('确认删除')

    await harness.result.handleConfirm()

    expect(deleteBanner).toHaveBeenCalledWith('banner-1')
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-banners'] })
    expect(harness.result.confirmDialog.value.open).toBe(false)
  })
})
