import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { fetchEventById, offlineEvent, publishEvent } from '@/api/event/event'
import { queryKeys } from '@/constants'

export function useEventEditPage() {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient()

  const eventId = computed(() => route.params.id as string | undefined)
  const isEdit = computed(() => Boolean(eventId.value))
  const currentTab = ref('basic-display')
  const isSaving = ref(false)

  const eventDetailQueryKey = computed(() => queryKeys.admin.eventDetail(eventId.value))

  const { data: eventDetailData } = useQuery({
    queryKey: eventDetailQueryKey,
    queryFn: () => (eventId.value ? fetchEventById(eventId.value) : Promise.resolve(undefined)),
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

  const publishMutation = useMutation({
    mutationFn: () => publishEvent(eventId.value!),
    onSuccess: () => {
      toast.success('活动发布成功')
      invalidateEventDetail()
    },
    onError: () => {
      toast.error('发布失败')
    },
  })

  const offlineMutation = useMutation({
    mutationFn: () => offlineEvent(eventId.value!),
    onSuccess: () => {
      toast.success('活动已下线')
      invalidateEventDetail()
    },
    onError: () => {
      toast.error('下线失败')
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
