import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useQueryEnabled } from '../useQueryEnabled'

describe('useQueryEnabled', () => {
  it('normalizes plain booleans, refs, and getters', () => {
    const plain = useQueryEnabled(false)
    expect(plain.value).toBe(false)

    const source = ref(false)
    const fromRef = useQueryEnabled(source)
    expect(fromRef.value).toBe(false)

    source.value = true
    expect(fromRef.value).toBe(true)

    const fromGetter = useQueryEnabled(() => source.value)
    expect(fromGetter.value).toBe(true)
  })
})
