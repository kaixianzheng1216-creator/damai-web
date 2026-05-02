import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createEvent, updateEvent } from '@/api/event/event'
import type { EventCreateRequest, EventUpdateRequest } from '@/api/event'
import { queryKeys, TOAST_COPY } from '@/constants'
import type { EventBasicForm } from './useEventBasicForm'

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
  const isLoading = ref(false)

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
    if (
      !basicForm.name ||
      !basicForm.categoryId ||
      !basicForm.venueId ||
      !basicForm.cityId ||
      !basicForm.coverUrl
    ) {
      toast.error(TOAST_COPY.fillCompleteInfo)
      return
    }

    isLoading.value = true
    try {
      const submitData = buildSubmitData()
      const eventId = toValue(options.eventId)
      if (toValue(options.isEdit) && eventId) {
        await updateMutation.mutateAsync({ id: eventId, data: submitData })
        return
      }

      await createMutation.mutateAsync(submitData)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    createMutation,
    updateMutation,
    save,
  }
}
