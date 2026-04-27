import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export interface QueryEnabledOptions {
  enabled?: MaybeRefOrGetter<boolean>
}

export function useQueryEnabled(enabled: MaybeRefOrGetter<boolean> = true) {
  return computed(() => toValue(enabled))
}
