import { reactive, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adminBatchAddSessions, adminDeleteSession, adminUpdateSession } from '@/api/event/event'
import type { SessionItem, SessionUpdateRequest, SessionVO } from '@/api/event'
import { queryKeys, TOAST_COPY, FORM_COPY } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { formatDateTimeLocalInput } from '@/utils/format'

interface UseSessionListOptions {
  eventId: MaybeRefOrGetter<string>
  onUpdated: () => void
}

type BatchSessionRow = {
  name: string
  startAt: string
  endAt: string
}

export function useSessionList(options: UseSessionListOptions) {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const showSessionDialog = ref(false)
  const editingSessionId = ref<string | null>(null)
  const sessionError = ref('')

  const sessionForm = reactive<SessionItem & Partial<SessionUpdateRequest>>({
    name: '',
    startAt: '',
    endAt: '',
  })

  const batchSessionRows = ref<BatchSessionRow[]>([{ name: '', startAt: '', endAt: '' }])

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  const addBatchRow = () => {
    batchSessionRows.value.push({ name: '', startAt: '', endAt: '' })
  }

  const removeBatchRow = (index: number) => {
    if (batchSessionRows.value.length > 1) {
      batchSessionRows.value.splice(index, 1)
    }
  }

  const openSessionCreate = () => {
    batchSessionRows.value = [{ name: '', startAt: '', endAt: '' }]
    editingSessionId.value = null
    sessionError.value = ''
    showSessionDialog.value = true
  }

  const openSessionEdit = (session: SessionVO) => {
    sessionForm.name = session.name
    sessionForm.startAt = formatDateTimeLocalInput(session.startAt)
    sessionForm.endAt = formatDateTimeLocalInput(session.endAt)
    editingSessionId.value = session.id
    sessionError.value = ''
    showSessionDialog.value = true
  }

  const batchAddSessionsMutation = useMutation({
    mutationFn: (sessions: SessionItem[]) =>
      adminBatchAddSessions(toValue(options.eventId), { sessions }),
    onSuccess: () => {
      toast.success(TOAST_COPY.sessionAdded)
      sessionError.value = ''
      showSessionDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      sessionError.value = FORM_COPY.sessionAddFailedRetry
      toast.error(TOAST_COPY.sessionAddFailed)
    },
  })

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SessionUpdateRequest }) =>
      adminUpdateSession(toValue(options.eventId), sessionId, data),
    onSuccess: () => {
      toast.success(TOAST_COPY.sessionUpdated)
      sessionError.value = ''
      showSessionDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      sessionError.value = FORM_COPY.sessionUpdateFailedRetry
      toast.error(TOAST_COPY.sessionUpdateFailed)
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => adminDeleteSession(toValue(options.eventId), sessionId),
    onSuccess: () => {
      toast.success(TOAST_COPY.sessionDeleted)
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error(TOAST_COPY.sessionDeleteFailed)
    },
  })

  const handleSaveSession = async () => {
    if (editingSessionId.value) {
      if (!sessionForm.name) {
        sessionError.value = FORM_COPY.fillSessionName
        toast.error(TOAST_COPY.fillSessionName)
        return
      }
      sessionError.value = ''
      await updateSessionMutation.mutateAsync({
        sessionId: editingSessionId.value,
        data: sessionForm,
      })
      return
    }

    const validRows = batchSessionRows.value.filter((row) => row.name)
    if (validRows.length === 0) {
      sessionError.value = FORM_COPY.fillAtLeastOneSession
      toast.error(TOAST_COPY.fillAtLeastOneSession)
      return
    }
    sessionError.value = ''
    await batchAddSessionsMutation.mutateAsync(validRows)
  }

  const handleDeleteSession = (session: SessionVO) => {
    openConfirm('确认删除', `确认删除场次「${session.name}」？`, () =>
      deleteSessionMutation.mutateAsync(session.id),
    )
  }

  return {
    confirmDialog,
    showSessionDialog,
    editingSessionId,
    sessionError,
    sessionForm,
    batchSessionRows,
    addBatchRow,
    removeBatchRow,
    batchAddSessionsMutation,
    updateSessionMutation,
    openSessionCreate,
    openSessionEdit,
    handleSaveSession,
    handleDeleteSession,
    closeConfirm,
    handleConfirm,
  }
}
