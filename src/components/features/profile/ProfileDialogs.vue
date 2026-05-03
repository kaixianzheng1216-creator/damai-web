<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { PROFILE_DIALOG_COPY } from '@/constants'
import ProfilePassengerDialog from './ProfilePassengerDialog.vue'
import type { usePassengerManagement } from '@/composables/profile/usePassengerManagement'
import type { useWorkOrderList } from '@/composables/profile/useWorkOrderList'

const ProfileWorkOrderDetailDialog = defineAsyncComponent(
  () => import('./ProfileWorkOrderDetailDialog.vue'),
)

type PassengerManagementState = ReturnType<typeof usePassengerManagement>
type WorkOrderListState = ReturnType<typeof useWorkOrderList>

defineProps<{
  passengerManagement: PassengerManagementState
  workOrderList: WorkOrderListState
}>()
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <ProfilePassengerDialog
    v-model:form="passengerManagement.passengerForm"
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
    v-model:reply-content="workOrderList.replyContent.value"
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
  <!-- eslint-enable vue/no-mutating-props -->
</template>
