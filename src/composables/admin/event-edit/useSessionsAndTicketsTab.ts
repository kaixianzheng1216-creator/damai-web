import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adminDeleteTicketType } from '@/api/event/event'
import type { SessionVO, TicketTypeVO } from '@/api/event'
import { queryKeys, TOAST_COPY } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

interface UseSessionsAndTicketsTabOptions {
  eventId: MaybeRefOrGetter<string>
  onUpdated: () => void
}

export function useSessionsAndTicketsTab(options: UseSessionsAndTicketsTabOptions) {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const showTicketTypeDialog = ref(false)
  const showInventoryDialog = ref(false)
  const showCopyDialog = ref(false)

  const activeSessionId = ref<string | null>(null)
  const editingTicketType = ref<TicketTypeVO | null>(null)
  const inventoryTicketType = ref<TicketTypeVO | null>(null)
  const copySourceSession = ref<SessionVO | null>(null)

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  const deleteTicketTypeMutation = useMutation({
    mutationFn: (ticketTypeId: string) =>
      adminDeleteTicketType(toValue(options.eventId), ticketTypeId),
    onSuccess: () => {
      toast.success(TOAST_COPY.ticketTypeDeleted)
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error(TOAST_COPY.ticketTypeDeleteFailed)
    },
  })

  const handleCreateTicketType = (sessionId: string) => {
    activeSessionId.value = sessionId
    editingTicketType.value = null
    showTicketTypeDialog.value = true
  }

  const handleEditTicketType = (ticketType: TicketTypeVO) => {
    editingTicketType.value = ticketType
    activeSessionId.value = null
    showTicketTypeDialog.value = true
  }

  const handleAdjustInventory = (ticketType: TicketTypeVO) => {
    inventoryTicketType.value = ticketType
    showInventoryDialog.value = true
  }

  const handleDeleteTicketType = (ticketType: TicketTypeVO) => {
    openConfirm('确认删除', `确认删除票种「${ticketType.name}」？`, () =>
      deleteTicketTypeMutation.mutateAsync(ticketType.id),
    )
  }

  const handleCopyTicketTypes = (session: SessionVO) => {
    copySourceSession.value = session
    showCopyDialog.value = true
  }

  return {
    confirmDialog,
    showTicketTypeDialog,
    showInventoryDialog,
    showCopyDialog,
    activeSessionId,
    editingTicketType,
    inventoryTicketType,
    copySourceSession,
    handleCreateTicketType,
    handleEditTicketType,
    handleAdjustInventory,
    handleDeleteTicketType,
    handleCopyTicketTypes,
    closeConfirm,
    handleConfirm,
  }
}
