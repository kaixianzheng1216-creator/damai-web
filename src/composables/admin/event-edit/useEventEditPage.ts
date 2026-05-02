import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { fetchAdminEventById, offlineEvent, publishEvent } from '@/api/event/event'
import { queryKeys, TOAST_COPY } from '@/constants'

export function useEventEditPage() {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient()

  const eventId = computed(() => {
    const id = route.params.id
    return Array.isArray(id) ? id[0] : id
  })
  const isEdit = computed(() => Boolean(eventId.value))
  const currentTab = ref('basic-display')
  const isSaving = ref(false)

  const eventDetailQueryKey = computed(() => queryKeys.admin.eventDetail(eventId.value))

  const { data: eventDetailData } = useQuery({
    queryKey: eventDetailQueryKey,
    queryFn: () =>
      eventId.value ? fetchAdminEventById(eventId.value) : Promise.resolve(undefined),
    enabled: computed(() => Boolean(eventId.value)),
    staleTime: 1000 * 60 * 5,
  })

  const eventData = computed(() => eventDetailData.value?.event)
  const eventServices = computed(() => eventDetailData.value?.services ?? [])
  const eventParticipants = computed(() => eventDetailData.value?.participants ?? [])
  const eventInfo = computed(() => eventDetailData.value?.info)
  const sessionsData = computed(() => eventDetailData.value?.sessions)

  const invalidateEventDetail = () => {
    queryClient.invalidateQueries({ queryKey: eventDetailQueryKey.value })
  }

  const requireEventId = () => {
    if (!eventId.value) {
      throw new Error('Missing event id')
    }
    return eventId.value
  }

  const publishMutation = useMutation({
    mutationFn: () => publishEvent(requireEventId()),
    onSuccess: () => {
      toast.success(TOAST_COPY.eventPublished)
      invalidateEventDetail()
    },
    onError: () => {
      toast.error(TOAST_COPY.eventPublishFailed)
    },
  })

  const offlineMutation = useMutation({
    mutationFn: () => offlineEvent(requireEventId()),
    onSuccess: () => {
      toast.success(TOAST_COPY.eventOfflined)
      invalidateEventDetail()
    },
    onError: () => {
      toast.error(TOAST_COPY.eventOfflineFailed)
    },
  })

  const handleCreated = (newEventId: string) => {
    router.push(`/admin/events/${newEventId}/edit`)
  }

  const goBack = () => {
    router.push('/admin/events')
  }

  return {
    eventId,
    isEdit,
    currentTab,
    isSaving,
    eventData,
    eventServices,
    eventParticipants,
    eventInfo,
    sessionsData,
    publishMutation,
    offlineMutation,
    handleCreated,
    goBack,
    invalidateEventDetail,
  }
}
