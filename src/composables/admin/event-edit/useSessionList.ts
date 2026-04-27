import { reactive, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { batchAddSessions, deleteSession, updateSession } from '@/api/event/event'
import type { SessionItem, SessionUpdateRequest, SessionVO } from '@/api/event'
import { queryKeys } from '@/constants'
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
    showSessionDialog.value = true
  }

  const openSessionEdit = (session: SessionVO) => {
    sessionForm.name = session.name
    sessionForm.startAt = formatDateTimeLocalInput(session.startAt)
    sessionForm.endAt = formatDateTimeLocalInput(session.endAt)
    editingSessionId.value = session.id
    showSessionDialog.value = true
  }

  const batchAddSessionsMutation = useMutation({
    mutationFn: (sessions: SessionItem[]) =>
      batchAddSessions(toValue(options.eventId), { sessions }),
    onSuccess: () => {
      toast.success('场次添加成功')
      showSessionDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('添加失败')
    },
  })

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SessionUpdateRequest }) =>
      updateSession(toValue(options.eventId), sessionId, data),
    onSuccess: () => {
      toast.success('场次更新成功')
      showSessionDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('更新失败')
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteSession(toValue(options.eventId), sessionId),
    onSuccess: () => {
      toast.success('场次删除成功')
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('删除失败')
    },
  })

  const handleSaveSession = async () => {
    if (editingSessionId.value) {
      if (!sessionForm.name) {
        toast.error('请填写场次名称')
        return
      }
      await updateSessionMutation.mutateAsync({
        sessionId: editingSessionId.value,
        data: sessionForm,
      })
      return
    }

    const validRows = batchSessionRows.value.filter((row) => row.name)
    if (validRows.length === 0) {
      toast.error('请至少填写一个场次名称')
      return
    }
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
    sessionForm,
    batchSessionRows,
    addBatchRow,
    removeBatchRow,
    openSessionCreate,
    openSessionEdit,
    handleSaveSession,
    handleDeleteSession,
    closeConfirm,
    handleConfirm,
  }
}
