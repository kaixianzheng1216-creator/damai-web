<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { deleteTicketType } from '@/api/event/event'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SessionList from './SessionList.vue'
import TicketTypeDialog from './TicketTypeDialog.vue'
import InventoryAdjustDialog from './InventoryAdjustDialog.vue'
import TicketTypeCopyDialog from './TicketTypeCopyDialog.vue'
import type { SessionVO, TicketTypeVO } from '@/api/event'

interface Props {
  eventId: string
  sessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const queryClient = useQueryClient()

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

// ─── Confirm Dialog ───────────────────────────────────────

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => {
  confirmDialog.value.open = false
}
const handleConfirm = () => {
  confirmDialog.value.onConfirm()
  closeConfirm()
}

// ─── Dialog State ─────────────────────────────────────────

const showTicketTypeDialog = ref(false)
const showInventoryDialog = ref(false)
const showCopyDialog = ref(false)

const activeSessionId = ref<string | null>(null)
const editingTicketType = ref<TicketTypeVO | null>(null)
const inventoryTicketType = ref<TicketTypeVO | null>(null)
const copySourceSession = ref<SessionVO | null>(null)

// ─── Ticket Type Operations ────────────────────────────────

const deleteTicketTypeMutation = useMutation({
  mutationFn: (ticketTypeId: string) => deleteTicketType(props.eventId, ticketTypeId),
  onSuccess: () => {
    toast.success('票种删除成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('删除失败')
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
    deleteTicketTypeMutation.mutate(ticketType.id),
  )
}

const handleCopyTicketTypes = (session: SessionVO) => {
  copySourceSession.value = session
  showCopyDialog.value = true
}

const handleUpdated = () => {
  emit('updated')
}
</script>

<template>
  <div class="space-y-4">
    <SessionList
      :event-id="eventId"
      :sessions="sessions"
      @updated="handleUpdated"
      @create-ticket-type="handleCreateTicketType"
      @edit-ticket-type="handleEditTicketType"
      @adjust-inventory="handleAdjustInventory"
      @delete-ticket-type="handleDeleteTicketType"
      @copy-ticket-types="handleCopyTicketTypes"
    />

    <TicketTypeDialog
      v-model:open="showTicketTypeDialog"
      :event-id="eventId"
      :editing-ticket-type="editingTicketType"
      :session-id="activeSessionId"
      @saved="handleUpdated"
    />

    <InventoryAdjustDialog
      v-model:open="showInventoryDialog"
      :event-id="eventId"
      :ticket-type="inventoryTicketType"
      @saved="handleUpdated"
    />

    <TicketTypeCopyDialog
      v-model:open="showCopyDialog"
      :event-id="eventId"
      :source-session="copySourceSession"
      :all-sessions="sessions"
      @copied="handleUpdated"
    />

    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>
