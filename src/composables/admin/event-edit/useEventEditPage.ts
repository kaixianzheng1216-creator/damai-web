import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import {
  fetchAdminEventById,
  fetchAdminTicketInventories,
  offlineEvent,
  publishEvent,
} from '@/api/event/event'
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
  })

  const eventData = computed(() => eventDetailData.value?.event)
  const eventServices = computed(() => eventDetailData.value?.services ?? [])
  const eventParticipants = computed(() => eventDetailData.value?.participants ?? [])
  const eventInfo = computed(() => eventDetailData.value?.info)
  const sessionsData = computed(() => eventDetailData.value?.sessions)
  const ticketTypeIds = computed(
    () =>
      sessionsData.value?.flatMap((session) =>
        (session.ticketTypes ?? []).map((ticketType) => ticketType.id),
      ) ?? [],
  )
  const ticketInventoriesQueryKey = computed(() =>
    queryKeys.admin.eventTicketInventories(eventId.value, ticketTypeIds),
  )

  const { data: ticketInventoriesData } = useQuery({
    queryKey: ticketInventoriesQueryKey,
    queryFn: () =>
      eventId.value && ticketTypeIds.value.length > 0
        ? fetchAdminTicketInventories(eventId.value, ticketTypeIds.value)
        : Promise.resolve({}),
    enabled: computed(
      () =>
        currentTab.value === 'sessions-tickets' &&
        Boolean(eventId.value) &&
        ticketTypeIds.value.length > 0,
    ),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })

  const invalidateEventDetail = () => {
    queryClient.invalidateQueries({ queryKey: eventDetailQueryKey.value })
  }

  const invalidateTicketInventories = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventTicketInventories(eventId.value),
    })
  }

  const invalidateEventAfterSave = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('events') })
    invalidateEventDetail()
    invalidateTicketInventories()
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
      invalidateEventAfterSave()
    },
    onError: () => {
      toast.error(TOAST_COPY.eventPublishFailed)
    },
  })

  const offlineMutation = useMutation({
    mutationFn: () => offlineEvent(requireEventId()),
    onSuccess: () => {
      toast.success(TOAST_COPY.eventOfflined)
      invalidateEventAfterSave()
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
    ticketInventoriesData,
    publishMutation,
    offlineMutation,
    handleCreated,
    goBack,
    invalidateEventDetail,
    invalidateTicketInventories,
    invalidateEventAfterSave,
  }
}
