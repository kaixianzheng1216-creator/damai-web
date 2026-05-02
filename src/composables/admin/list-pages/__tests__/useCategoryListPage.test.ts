import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategoriesPage,
  updateCategory,
} from '@/api/event/category'
import { useCategoryListPage } from '../useCategoryListPage'
import type { CategoryVO, PageResponseCategoryVO } from '@/api/event'

vi.mock('@/api/event/category', () => ({
  fetchAdminCategoriesPage: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

const createCategoryVO = (overrides: Partial<CategoryVO> = {}): CategoryVO => ({
  id: 'cat-1',
  parentId: '0',
  name: '演唱会',
  sortOrder: 1,
  children: [],
  ...overrides,
})

const createPage = <T>(records: T[]): PageResponseCategoryVO => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

function setupCategoryListPage() {
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
    return scope.run(() => useCategoryListPage())
  })

  if (!result) {
    throw new Error('useCategoryListPage did not initialize')
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

describe('useCategoryListPage', () => {
  it('loads category tree with pagination', async () => {
    const category = createCategoryVO()
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([category]))
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(fetchAdminCategoriesPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        name: undefined,
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.list.value).toEqual([category])
    })
    expect(harness.result.totalRow.value).toBe(1)
    expect(harness.result.totalPages.value).toBe(1)
  })

  it('creates a category, invalidates list, and closes dialog', async () => {
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([]))
    vi.mocked(createCategory).mockResolvedValue('cat-2')
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    harness.result.openCreate()
    expect(harness.result.showDialog.value).toBe(true)
    expect(harness.result.dialogTitle.value).toBe('新建分类')

    harness.result.form.name = '话剧歌剧'
    harness.result.form.sortOrder = 2

    await harness.result.handleSubmit()

    expect(createCategory).toHaveBeenCalledWith({
      name: '话剧歌剧',
      parentId: '0',
      sortOrder: 2,
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-categories'] })
    expect(harness.result.showDialog.value).toBe(false)
  })

  it('edits a category, invalidates list, and closes dialog', async () => {
    const category = createCategoryVO()
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([category]))
    vi.mocked(updateCategory).mockResolvedValue(undefined)
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchAdminCategoriesPage).toHaveBeenCalled())

    harness.result.openEdit(category)
    expect(harness.result.showDialog.value).toBe(true)
    expect(harness.result.dialogTitle.value).toBe('编辑分类')
    expect(harness.result.form.name).toBe('演唱会')

    harness.result.form.name = '流行演唱会'
    await harness.result.handleSubmit()

    expect(updateCategory).toHaveBeenCalledWith('cat-1', {
      name: '流行演唱会',
      sortOrder: 1,
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-categories'] })
    expect(harness.result.showDialog.value).toBe(false)
  })

  it('does not create a category when name is empty', async () => {
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([]))
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    harness.result.openCreate()
    harness.result.form.name = ''

    await harness.result.handleSubmit()

    expect(createCategory).not.toHaveBeenCalled()
    expect(harness.result.showDialog.value).toBe(true)
  })

  it('confirms and deletes a category', async () => {
    const category = createCategoryVO()
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([category]))
    vi.mocked(deleteCategory).mockResolvedValue(undefined)
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchAdminCategoriesPage).toHaveBeenCalled())

    harness.result.handleDelete(category)
    expect(harness.result.confirmDialog.value.open).toBe(true)
    expect(harness.result.confirmDialog.value.title).toBe('确认删除')

    await harness.result.handleConfirm()

    expect(deleteCategory).toHaveBeenCalledWith('cat-1')
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-categories'] })
    expect(harness.result.confirmDialog.value.open).toBe(false)
  })

  it('manages children: opens children dialog and creates a child category', async () => {
    const parent = createCategoryVO({ id: 'parent-1', name: '体育', children: [] })
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([parent]))
    vi.mocked(createCategory).mockResolvedValue('child-1')
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchAdminCategoriesPage).toHaveBeenCalled())

    harness.result.openManageChildren(parent)
    expect(harness.result.showChildrenDialog.value).toBe(true)
    expect(harness.result.selectedParent.value).toEqual(parent)

    harness.result.openCreateChild()
    expect(harness.result.showChildDialog.value).toBe(true)
    expect(harness.result.childDialogTitle.value).toBe('新建子分类')

    harness.result.childForm.name = '篮球'
    harness.result.childForm.sortOrder = 1

    await harness.result.handleChildSubmit()

    expect(createCategory).toHaveBeenCalledWith({
      name: '篮球',
      parentId: 'parent-1',
      sortOrder: 1,
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-categories'] })
    expect(harness.result.showChildDialog.value).toBe(false)
  })

  it('edits a child category', async () => {
    const child = createCategoryVO({ id: 'child-1', parentId: 'parent-1', name: '足球' })
    const parent = createCategoryVO({ id: 'parent-1', name: '体育', children: [child] })
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([parent]))
    vi.mocked(updateCategory).mockResolvedValue(undefined)
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    await vi.waitFor(() => expect(fetchAdminCategoriesPage).toHaveBeenCalled())

    harness.result.openManageChildren(parent)
    harness.result.openEditChild(child)
    expect(harness.result.showChildDialog.value).toBe(true)
    expect(harness.result.childDialogTitle.value).toBe('编辑子分类')

    harness.result.childForm.name = '羽毛球'
    await harness.result.handleChildSubmit()

    expect(updateCategory).toHaveBeenCalledWith('child-1', {
      name: '羽毛球',
      sortOrder: 1,
    })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-categories'] })
  })

  it('resets page to 1 when search name changes', async () => {
    vi.mocked(fetchAdminCategoriesPage).mockResolvedValue(createPage([]))
    const harness = setupCategoryListPage()
    cleanup = harness.cleanup

    harness.result.currentPage.value = 3
    await nextTick()

    harness.result.searchName.value = '演唱'
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)
    await vi.waitFor(() => {
      expect(fetchAdminCategoriesPage).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        name: '演唱',
      })
    })
  })
})
