<script setup lang="ts">
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SessionList from './SessionList.vue'
import TicketTypeDialog from './TicketTypeDialog.vue'
import InventoryAdjustDialog from './InventoryAdjustDialog.vue'
import TicketTypeCopyDialog from './TicketTypeCopyDialog.vue'
import type { SessionVO } from '@/api/event'
import { useSessionsAndTicketsTab } from '@/composables/admin'

interface Props {
  eventId: string
  sessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const handleUpdated = () => {
  emit('updated')
}

const {
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
} = useSessionsAndTicketsTab({
  eventId: () => props.eventId,
  onUpdated: handleUpdated,
})
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
      :confirm-text="confirmDialog.confirmText"
      :confirm-variant="confirmDialog.confirmVariant"
      :loading="confirmDialog.isProcessing"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>
