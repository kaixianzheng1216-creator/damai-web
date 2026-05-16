import { computed, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adminCopyTicketTypes } from '@/api/event/event'
import type { SessionVO } from '@/api/event'
import { queryKeys, TOAST_COPY } from '@/constants'

interface UseTicketTypeCopyDialogOptions {
  eventId: MaybeRefOrGetter<string>
  sourceSession: MaybeRefOrGetter<SessionVO | null>
  allSessions: MaybeRefOrGetter<SessionVO[] | undefined>
  onOpenChange: (open: boolean) => void
  onCopied: () => void
}

export function useTicketTypeCopyDialog(options: UseTicketTypeCopyDialogOptions) {
  const queryClient = useQueryClient()
  const copyTargetSessionIds = ref<string[]>([])

  const targetSessions = computed(() => {
    const sourceSessionId = toValue(options.sourceSession)?.id
    return (toValue(options.allSessions) ?? []).filter((session) => session.id !== sourceSessionId)
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  watch(
    () => toValue(options.sourceSession)?.id,
    () => {
      copyTargetSessionIds.value = []
    },
  )

  const setCopyTarget = (sessionId: string, checked: boolean | 'indeterminate') => {
    const index = copyTargetSessionIds.value.indexOf(sessionId)
    if (checked === true && index === -1) {
      copyTargetSessionIds.value.push(sessionId)
      return
    }
    if (checked !== true && index !== -1) {
      copyTargetSessionIds.value.splice(index, 1)
    }
  }

  const copyTicketTypesMutation = useMutation({
    mutationFn: ({
      sourceSessionId,
      targetSessionIds,
    }: {
      sourceSessionId: string
      targetSessionIds: string[]
    }) => adminCopyTicketTypes(toValue(options.eventId), { sourceSessionId, targetSessionIds }),
    onSuccess: () => {
      toast.success(TOAST_COPY.ticketTypesCopied)
      options.onOpenChange(false)
      invalidateAll()
      options.onCopied()
    },
    onError: () => {
      toast.error(TOAST_COPY.ticketTypesCopyFailed)
    },
  })

  const handleCopyTicketTypes = async () => {
    const sourceSession = toValue(options.sourceSession)
    if (!sourceSession) return

    const result = z
      .array(z.string())
      .min(1, TOAST_COPY.selectTargetSession)
      .safeParse(copyTargetSessionIds.value)
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? TOAST_COPY.selectTargetSession)
      return
    }

    await copyTicketTypesMutation.mutateAsync({
      sourceSessionId: sourceSession.id,
      targetSessionIds: copyTargetSessionIds.value,
    })
  }

  return {
    copyTargetSessionIds,
    targetSessions,
    copyTicketTypesMutation,
    setCopyTarget,
    handleCopyTicketTypes,
  }
}
