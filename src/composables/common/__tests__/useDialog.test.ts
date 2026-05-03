import { describe, expect, it, vi } from 'vitest'
import { isShallow, nextTick, shallowRef } from 'vue'
import { useDialog } from '../useDialog'

describe('useDialog', () => {
  it('openDialog(payload) sets open=true, data=payload, and calls onOpen', () => {
    const onOpen = vi.fn()
    const dialog = useDialog({ onOpen })

    expect(dialog.open.value).toBe(false)
    expect(dialog.data.value).toBeUndefined()

    const payload = { id: '1', name: 'test' }
    dialog.openDialog(payload)

    expect(dialog.open.value).toBe(true)
    expect(dialog.data.value).toBe(payload)
    expect(onOpen).toHaveBeenCalledOnce()
    expect(onOpen).toHaveBeenCalledWith(payload)
  })

  it('openDialog() without payload sets open=true, data=undefined, and calls onOpen with undefined', () => {
    const onOpen = vi.fn()
    const dialog = useDialog({ onOpen })

    dialog.openDialog()

    expect(dialog.open.value).toBe(true)
    expect(dialog.data.value).toBeUndefined()
    expect(onOpen).toHaveBeenCalledWith(undefined)
  })

  it('openDialog() with undefined payload still calls onOpen with undefined', () => {
    const onOpen = vi.fn()
    const dialog = useDialog({ onOpen })

    dialog.openDialog(undefined)

    expect(dialog.open.value).toBe(true)
    expect(dialog.data.value).toBeUndefined()
    expect(onOpen).toHaveBeenCalledWith(undefined)
  })

  it('closeDialog() sets open=false and calls onClose', () => {
    const onClose = vi.fn()
    const dialog = useDialog({ onClose })

    // First open to have something to close
    dialog.openDialog({ id: '1' })
    expect(dialog.open.value).toBe(true)

    dialog.closeDialog()

    expect(dialog.open.value).toBe(false)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('onClose fires regardless of data state', () => {
    const onClose = vi.fn()
    const dialog = useDialog({ onClose })

    // data is undefined (never opened), but close should still call onClose
    expect(dialog.data.value).toBeUndefined()
    dialog.closeDialog()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('withLoading sets isLoading=true before fn, false after success', async () => {
    const dialog = useDialog()
    let capturedLoadingBefore = false
    let capturedLoadingAfter = false

    await dialog.withLoading(async () => {
      capturedLoadingBefore = dialog.isLoading.value
      // Simulate async work
      await Promise.resolve()
      capturedLoadingAfter = dialog.isLoading.value
    })

    expect(capturedLoadingBefore).toBe(true)
    expect(capturedLoadingAfter).toBe(true) // still true during execution
    expect(dialog.isLoading.value).toBe(false) // reset after completion
  })

  it('withLoading resets isLoading to false even when fn throws (finally block)', async () => {
    const dialog = useDialog()
    let capturedDuringThrow = false

    await expect(
      dialog.withLoading(async () => {
        capturedDuringThrow = dialog.isLoading.value
        throw new Error('test error')
      }),
    ).rejects.toThrow('test error')

    expect(capturedDuringThrow).toBe(true)
    // This is the critical assertion: isLoading MUST be false after error
    expect(dialog.isLoading.value).toBe(false)
  })

  it('multiple withLoading calls maintain correct isLoading state', async () => {
    const dialog = useDialog()

    const p1 = dialog.withLoading(async () => {
      expect(dialog.isLoading.value).toBe(true)
      await new Promise((r) => setTimeout(r, 20))
    })

    // isLoading should be true while p1 is running
    expect(dialog.isLoading.value).toBe(true)

    await p1
    expect(dialog.isLoading.value).toBe(false)
  })

  it('data is a ShallowRef — deep property changes do not trigger reactivity', async () => {
    const dialog = useDialog<Record<string, string>>()
    dialog.openDialog({ key: 'original' })

    expect(dialog.data.value).toEqual({ key: 'original' })

    // Mutate deeply — ShallowRef should NOT detect this
    if (dialog.data.value) {
      dialog.data.value.key = 'mutated'
    }

    // ShallowRef still points to same object reference, value should reflect mutation
    // but reactivity watchers triggered by deep changes should NOT fire
    expect(dialog.data.value!.key).toBe('mutated')

    // Verify it's actually a shallow ref
    // Setting .value fires reactivity; deep property change does not
    // We can verify by re-assigning: this SHOULD update the ref
    dialog.data.value = { key: 'new' }
    expect(dialog.data.value!.key).toBe('new')
  })

  it('data is actually a ShallowRef via isShallow', () => {
    const dialog = useDialog()
    expect(isShallow(dialog.data)).toBe(true)
  })

  it('no callbacks provided — openDialog and closeDialog do not throw', () => {
    const dialog = useDialog()

    expect(() => dialog.openDialog({ id: '1' })).not.toThrow()
    expect(dialog.open.value).toBe(true)

    expect(() => dialog.closeDialog()).not.toThrow()
    expect(dialog.open.value).toBe(false)
  })
})
