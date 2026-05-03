<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { PROFILE_DIALOG_COPY } from '@/constants'
import ProfilePassengerDialog from './ProfilePassengerDialog.vue'
import type { PassengerFormData } from '@/api/account'
import type { usePassengerManagement } from '@/composables/profile/usePassengerManagement'
import type { useWorkOrderList } from '@/composables/profile/useWorkOrderList'

const ProfileWorkOrderDetailDialog = defineAsyncComponent(
  () => import('./ProfileWorkOrderDetailDialog.vue'),
)

type PassengerManagementState = ReturnType<typeof usePassengerManagement>
type WorkOrderListState = ReturnType<typeof useWorkOrderList>

const props = defineProps<{
  passengerManagement: PassengerManagementState
  workOrderList: WorkOrderListState
}>()

const emit = defineEmits<{
  'update:passenger-form': [value: PassengerFormData]
  'update:reply-content': [value: string]
}>()

// Local copies to avoid mutating props
const localPassengerForm = ref<PassengerFormData>({ ...props.passengerManagement.passengerForm })
const localReplyContent = ref(props.workOrderList.replyContent.value)

// Sync prop → local
watch(
  () => ({ ...props.passengerManagement.passengerForm }),
  (v) => {
    localPassengerForm.value = v
  },
  { deep: true },
)

watch(
  () => props.workOrderList.replyContent.value,
  (v) => {
    localReplyContent.value = v
  },
)

// Sync local → parent
watch(
  localPassengerForm,
  (v) => {
    emit('update:passenger-form', v)
  },
  { deep: true },
)

watch(localReplyContent, (v) => {
  emit('update:reply-content', v)
})
</script>

<template>
  <ProfilePassengerDialog
    v-model:form="localPassengerForm"
    :open="passengerManagement.showPassengerModal.value"
    :passenger-error="passengerManagement.passengerError.value"
    :is-saving="passengerManagement.createPassengerMutation.isPending.value"
    @close="passengerManagement.closePassengerModal"
    @submit="passengerManagement.submitPassenger"
  />

  <ConfirmDialog
    :open="passengerManagement.showDeletePassengerModal.value"
    :title="PROFILE_DIALOG_COPY.deletePassengerTitle"
    :description="PROFILE_DIALOG_COPY.deletePassengerDescription"
    :confirm-text="PROFILE_DIALOG_COPY.deletePassengerConfirmText"
    confirm-variant="destructive"
    :loading="passengerManagement.deletePassengerMutation.isPending.value"
    @close="passengerManagement.closeDeletePassengerModal"
    @confirm="passengerManagement.confirmDeletePassenger"
  />

  <ProfileWorkOrderDetailDialog
    v-model:reply-content="localReplyContent"
    :open="!!workOrderList.selectedWorkOrderId.value"
    :work-order="workOrderList.selectedWorkOrder.value"
    :is-loading="workOrderList.workOrderDetailQuery.isLoading.value"
    :is-closing="workOrderList.closeWorkOrderMutation.isPending.value"
    :is-connected="workOrderList.isChatConnected.value"
    :reply-error="workOrderList.replyError.value"
    @close="workOrderList.closeWorkOrderDetail"
    @reply="workOrderList.submitWorkOrderReply"
    @close-work-order="workOrderList.confirmCloseWorkOrder"
  />
</template>
