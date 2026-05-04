import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createEvent, updateEvent } from '@/api/event/event'
import type { EventCreateRequest, EventUpdateRequest } from '@/api/event'
import { queryKeys, TOAST_COPY } from '@/constants'
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
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('events') })
    const eventId = toValue(options.eventId)
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventDetail(eventId) })
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: EventCreateRequest) => createEvent(payload),
    onSuccess: (eventId) => {
      toast.success(TOAST_COPY.eventCreated)
      options.onCreated(eventId)
    },
    onError: () => {
      toast.error(TOAST_COPY.eventCreateFailed)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdateRequest }) => updateEvent(id, data),
    onSuccess: () => {
      toast.success(TOAST_COPY.eventUpdated)
      invalidateAll()
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

  const save = async () => {
    const result = eventBasicSchema.safeParse(basicForm)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? TOAST_COPY.fillCompleteInfo
      toast.error(firstError)
      return
    }

    const submitData = buildSubmitData()
    const eventId = toValue(options.eventId)
    if (toValue(options.isEdit) && eventId) {
      await updateMutation.mutateAsync({ id: eventId, data: submitData })
      return
    }

    await createMutation.mutateAsync(submitData)
  }

  return {
    isLoading: computed(() => createMutation.isPending.value || updateMutation.isPending.value),
    createMutation,
    updateMutation,
    save,
  }
}
