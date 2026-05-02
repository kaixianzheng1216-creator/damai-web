import type { MaybeRefOrGetter } from 'vue'
import type { EventVO } from '@/api/event'
import { useEventBasicForm } from './useEventBasicForm'
import { useEventBasicSubmit } from './useEventBasicSubmit'

export interface UseEventBasicTabOptions {
  eventId: MaybeRefOrGetter<string | undefined>
  isEdit: MaybeRefOrGetter<boolean>
  eventData: MaybeRefOrGetter<EventVO | undefined>
  onCreated: (eventId: string) => void
  onUpdated: () => void
}

export function useEventBasicTab(options: UseEventBasicTabOptions) {
  const form = useEventBasicForm({ eventData: options.eventData })
  const submit = useEventBasicSubmit(options, form.basicForm)

  return {
    isLoading: submit.isLoading,
    basicForm: form.basicForm,
    cities: form.cities,
    categoryOptions: form.categoryOptions,
    venues: form.venues,
    series: form.series,
    createMutation: submit.createMutation,
    updateMutation: submit.updateMutation,
    save: submit.save,
  }
}
