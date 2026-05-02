import { computed, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { saveEventInfo } from '@/api/event/event'
import { fetchAdminNotices } from '@/api/event/notice'
import type { EventInfoCreateRequest, EventInfoVO } from '@/api/event'
import { NOTICE_TYPE, queryKeys, TOAST_COPY } from '@/constants'

interface UseEventInfoTabOptions {
  eventId: MaybeRefOrGetter<string>
  eventInfo: MaybeRefOrGetter<EventInfoVO | undefined>
  onUpdated: () => void
}

export function useEventInfoTab(options: UseEventInfoTabOptions) {
  const queryClient = useQueryClient()

  const { data: noticeTemplates } = useQuery({
    queryKey: queryKeys.admin.list('notices'),
    queryFn: fetchAdminNotices,
  })

  const purchaseTemplates = computed(() =>
    (noticeTemplates.value ?? [])
      .filter((notice) => notice.type === NOTICE_TYPE.PURCHASE)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  )

  const admissionTemplates = computed(() =>
    (noticeTemplates.value ?? [])
      .filter((notice) => notice.type === NOTICE_TYPE.ADMISSION)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  )

  const description = ref('')
  const purchaseContent = reactive<Record<string, string>>({})
  const admissionContent = reactive<Record<string, string>>({})

  const populateFromEventInfo = () => {
    const eventInfo = toValue(options.eventInfo)
    if (!eventInfo || !noticeTemplates.value) return

    description.value = eventInfo.description || ''

    for (const notice of eventInfo.purchaseNotice ?? []) {
      const template = purchaseTemplates.value.find((item) => item.name === notice.name)
      if (template) {
        purchaseContent[template.id] = notice.description
      }
    }

    for (const notice of eventInfo.admissionNotice ?? []) {
      const template = admissionTemplates.value.find((item) => item.name === notice.name)
      if (template) {
        admissionContent[template.id] = notice.description
      }
    }
  }

  watch([() => toValue(options.eventInfo), noticeTemplates], populateFromEventInfo, {
    immediate: true,
  })

  const saveEventInfoMutation = useMutation({
    mutationFn: (payload: EventInfoCreateRequest) =>
      saveEventInfo(toValue(options.eventId), payload),
    onSuccess: () => {
      toast.success(TOAST_COPY.infoSaved)
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
      })
      options.onUpdated()
    },
    onError: () => {
      toast.error(TOAST_COPY.infoSaveFailed)
    },
  })

  const save = async () => {
    const purchaseNotice = purchaseTemplates.value
      .filter((template) => purchaseContent[template.id]?.trim())
      .map((template) => ({ name: template.name, description: purchaseContent[template.id] ?? '' }))

    const admissionNotice = admissionTemplates.value
      .filter((template) => admissionContent[template.id]?.trim())
      .map((template) => ({
        name: template.name,
        description: admissionContent[template.id] ?? '',
      }))

    await saveEventInfoMutation.mutateAsync({
      description: description.value,
      purchaseNotice,
      admissionNotice,
    })
  }

  return {
    description,
    purchaseContent,
    admissionContent,
    purchaseTemplates,
    admissionTemplates,
    saveEventInfoMutation,
    save,
  }
}
