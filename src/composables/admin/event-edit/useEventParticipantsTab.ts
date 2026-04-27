import { computed, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { batchAddParticipants, removeParticipant } from '@/api/event/event'
import { fetchAdminParticipantsPage } from '@/api/event/participant'
import type { EventParticipantBatchAddRequest, EventParticipantVO } from '@/api/event'
import { queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

interface UseEventParticipantsTabOptions {
  eventId: MaybeRefOrGetter<string>
  eventParticipants: MaybeRefOrGetter<EventParticipantVO[]>
  onUpdated: () => void
}

const participantPageSize = 10

export function useEventParticipantsTab(options: UseEventParticipantsTabOptions) {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const showParticipantDialog = ref(false)
  const participantSearchQuery = ref('')
  const currentPage = ref(1)
  const selectedParticipantIds = ref<string[]>([])

  watch(participantSearchQuery, () => {
    currentPage.value = 1
  })

  const queryKey = computed(() => [
    ...queryKeys.admin.list('participants'),
    participantSearchQuery.value,
    currentPage.value,
  ])

  const { data: pageData, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminParticipantsPage({
        page: currentPage.value,
        size: participantPageSize,
        name: participantSearchQuery.value || undefined,
      }),
    enabled: showParticipantDialog,
  })

  const openParticipantDialog = () => {
    selectedParticipantIds.value = toValue(options.eventParticipants).map(
      (item) => item.participant.id,
    )
    participantSearchQuery.value = ''
    currentPage.value = 1
    showParticipantDialog.value = true
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  const batchAddParticipantsMutation = useMutation({
    mutationFn: (payload: EventParticipantBatchAddRequest) =>
      batchAddParticipants(toValue(options.eventId), payload),
    onSuccess: () => {
      toast.success('参与方添加成功')
      showParticipantDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('添加失败')
    },
  })

  const removeParticipantMutation = useMutation({
    mutationFn: (eventParticipantId: string) =>
      removeParticipant(toValue(options.eventId), eventParticipantId),
    onSuccess: () => {
      toast.success('参与方移除成功')
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('移除失败')
    },
  })

  const handleAddParticipants = async () => {
    const existingParticipantIds = new Set(
      toValue(options.eventParticipants).map((item) => item.participant.id),
    )
    const newParticipantIds = selectedParticipantIds.value.filter(
      (id) => !existingParticipantIds.has(id),
    )

    if (newParticipantIds.length === 0) {
      showParticipantDialog.value = false
      return
    }

    await batchAddParticipantsMutation.mutateAsync({
      participantIds: newParticipantIds,
    })
  }

  const handleRemoveParticipant = (eventParticipant: EventParticipantVO) => {
    openConfirm('确认移除', `确认移除参与方「${eventParticipant.participant.name}」？`, () =>
      removeParticipantMutation.mutateAsync(eventParticipant.id),
    )
  }

  const toggleParticipant = (participantId: string) => {
    const index = selectedParticipantIds.value.indexOf(participantId)
    if (index > -1) {
      selectedParticipantIds.value.splice(index, 1)
      return
    }
    selectedParticipantIds.value.push(participantId)
  }

  return {
    confirmDialog,
    showParticipantDialog,
    participantSearchQuery,
    currentPage,
    selectedParticipantIds,
    pageData,
    isFetching,
    batchAddParticipantsMutation,
    openParticipantDialog,
    handleAddParticipants,
    handleRemoveParticipant,
    toggleParticipant,
    closeConfirm,
    handleConfirm,
  }
}
