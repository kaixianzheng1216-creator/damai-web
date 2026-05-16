import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createEvent, updateEvent } from '@/api/event/event'
import type { EventCreateRequest, EventUpdateRequest } from '@/api/event'
import { TOAST_COPY } from '@/constants'
import type { EventBasicForm } from './useEventBasicForm'

const eventBasicSchema = z.object({
  name: z.string().min(1, TOAST_COPY.fillCompleteInfo),
  categoryId: z.string().min(1, TOAST_COPY.fillCompleteInfo),
  venueId: z.string().min(1, TOAST_COPY.fillCompleteInfo),
  cityId: z.string().min(1, TOAST_COPY.fillCompleteInfo),
  coverUrl: z.string().min(1, TOAST_COPY.fillCompleteInfo),
  recommendWeight: z.number().optional(),
  seriesId: z.string().optional(),
})

export interface UseEventBasicSubmitOptions {
  eventId: MaybeRefOrGetter<string | undefined>
  isEdit: MaybeRefOrGetter<boolean>
  onCreated: (eventId: string) => void
  onUpdated: () => void
}

export function useEventBasicSubmit(
  options: UseEventBasicSubmitOptions,
  basicForm: EventBasicForm,
) {
  const createMutation = useMutation({
    mutationFn: (payload: EventCreateRequest) => createEvent(payload),
    onSuccess: (eventId) => {
      options.onCreated(eventId)
    },
    onError: () => {
      toast.error(TOAST_COPY.eventCreateFailed)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdateRequest }) => updateEvent(id, data),
    onSuccess: () => {
      options.onUpdated()
    },
    onError: () => {
      toast.error(TOAST_COPY.eventUpdateFailed)
    },
  })

  const buildSubmitData = (): EventCreateRequest => ({
    categoryId: basicForm.categoryId,
    venueId: basicForm.venueId,
    cityId: basicForm.cityId,
    name: basicForm.name,
    coverUrl: basicForm.coverUrl,
    recommendWeight: basicForm.recommendWeight,
    seriesId: basicForm.seriesId === 'none' ? undefined : basicForm.seriesId,
  })

  const save = async (): Promise<boolean> => {
    const result = eventBasicSchema.safeParse(basicForm)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? TOAST_COPY.fillCompleteInfo
      toast.error(firstError)
      return false
    }

    const submitData = buildSubmitData()
    const eventId = toValue(options.eventId)
    if (toValue(options.isEdit) && eventId) {
      await updateMutation.mutateAsync({ id: eventId, data: submitData })
      return true
    }

    await createMutation.mutateAsync(submitData)
    return true
  }

  return {
    isLoading: computed(() => createMutation.isPending.value || updateMutation.isPending.value),
    createMutation,
    updateMutation,
    save,
  }
}
