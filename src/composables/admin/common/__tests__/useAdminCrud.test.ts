import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type EffectScope } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { useAdminCrud } from '../useAdminCrud'
import type { PaginatedResponse } from '@/api/types'

interface TestItem {
  id: string
  name: string
}

interface TestForm {
  name: string
}

const queryKeyBase = ['admin-test']

const createPage = (records: TestItem[] = []): PaginatedResponse<TestItem> => ({
  pageNumber: 1,
  pageSize: 10,
  totalRow: records.length,
  totalPage: 1,
  records,
})

const flushPromises = async () => {
  await Promise.resolve()
  await nextTick()
}

function setupCrud() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const app = createApp({})
  let scope: EffectScope | undefined

  const fetchPage = vi.fn(() => Promise.resolve(createPage([{ id: '1', name: 'Alpha' }])))
  const createItem = vi.fn(() => Promise.resolve())
  const updateItem = vi.fn(() => Promise.resolve())
  const deleteItem = vi.fn(() => Promise.resolve())

  app.use(VueQueryPlugin, { queryClient })

  const result = app.runWithContext(() => {
    scope = effectScope()
    return scope.run(() =>
      useAdminCrud<TestItem, TestForm, TestForm, Partial<TestForm>>({
        queryKeyBase,
        fetchPage,
        createItem,
        updateItem,
        deleteItem,
        initialForm: { name: '' },
        getDeleteConfirmMessage: (item) => ({
          title: `删除 ${item.name}`,
          description: `确认删除 ${item.name}？`,
        }),
      }),
    )
  })

  if (!result) {
    throw new Error('useAdminCrud did not initialize')
  }

  return {
    result,
    queryClient,
    invalidateSpy,
    fetchPage,
    createItem,
    updateItem,
    deleteItem,
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
  vi.restoreAllMocks()
})

describe('useAdminCrud', () => {
  it('fetches the first page with default pagination params', async () => {
    const harness = setupCrud()
    cleanup = harness.cleanup

    await vi.waitFor(() => {
      expect(harness.fetchPage).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        name: undefined,
      })
    })

    await vi.waitFor(() => {
      expect(harness.result.list.value).toEqual([{ id: '1', name: 'Alpha' }])
    })
    expect(harness.result.totalRow.value).toBe(1)
    expect(harness.result.totalPages.value).toBe(1)
  })

  it('resets to the first page when the search keyword changes', async () => {
    const harness = setupCrud()
    cleanup = harness.cleanup

    harness.result.currentPage.value = 3
    harness.result.searchName.value = 'VIP'
    await nextTick()

    expect(harness.result.currentPage.value).toBe(1)
  })

  it('creates and updates items with cache invalidation', async () => {
    const harness = setupCrud()
    cleanup = harness.cleanup

    harness.result.openCreate()
    harness.result.form.name = 'Created'
    await harness.result.handleSubmit({
      getCreateData: (form) => ({ name: form.name }),
      getUpdateData: (form) => ({ name: form.name }),
    })
    await flushPromises()

    expect(harness.createItem.mock.calls[0]?.[0]).toEqual({ name: 'Created' })
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeyBase })
    expect(harness.result.showDialog.value).toBe(false)

    harness.result.openEdit({ id: '1', name: 'Alpha' })
    harness.result.form.name = 'Updated'
    await harness.result.handleSubmit({
      getCreateData: (form) => ({ name: form.name }),
      getUpdateData: (form) => ({ name: form.name }),
    })
    await flushPromises()

    expect(harness.updateItem).toHaveBeenCalledWith('1', { name: 'Updated' })
    expect(harness.invalidateSpy).toHaveBeenCalledTimes(2)
    expect(harness.result.showDialog.value).toBe(false)
  })

  it('confirms destructive deletes before mutating and invalidating cache', async () => {
    const harness = setupCrud()
    cleanup = harness.cleanup

    harness.result.handleDelete({ id: '2', name: 'Beta' })

    expect(harness.result.confirmDialog.value.open).toBe(true)
    expect(harness.result.confirmDialog.value.title).toBe('删除 Beta')
    expect(harness.result.confirmDialog.value.confirmVariant).toBe('destructive')
    expect(harness.deleteItem).not.toHaveBeenCalled()

    await harness.result.handleConfirm()
    await flushPromises()

    expect(harness.deleteItem.mock.calls[0]?.[0]).toBe('2')
    expect(harness.invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeyBase })
    expect(harness.result.confirmDialog.value.open).toBe(false)
  })
})
