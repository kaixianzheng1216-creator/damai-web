<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { PROFILE_DIALOG_COPY } from '@/constants'
import ProfilePassengerDialog from './ProfilePassengerDialog.vue'
import { useProfilePageContext } from './profilePageContext'

const ProfileWorkOrderDetailDialog = defineAsyncComponent(
  () => import('./ProfileWorkOrderDetailDialog.vue'),
)

const profile = useProfilePageContext()
</script>

<template>
  <ProfilePassengerDialog
    v-model:form="profile.passengerForm"
    :open="profile.showPassengerModal.value"
    :passenger-error="profile.passengerError.value"
    :is-saving="profile.createPassengerMutation.isPending.value"
    @close="profile.closePassengerModal"
    @submit="profile.submitPassenger"
  />

  <ConfirmDialog
    :open="profile.showDeletePassengerModal.value"
    :title="PROFILE_DIALOG_COPY.deletePassengerTitle"
    :description="PROFILE_DIALOG_COPY.deletePassengerDescription"
    :confirm-text="PROFILE_DIALOG_COPY.deletePassengerConfirmText"
    confirm-variant="destructive"
    :loading="profile.deletePassengerMutation.isPending.value"
    @close="profile.closeDeletePassengerModal"
    @confirm="profile.confirmDeletePassenger"
  />

  <ProfileWorkOrderDetailDialog
    v-model:reply-content="profile.replyContent.value"
    :open="!!profile.selectedWorkOrderId.value"
    :work-order="profile.selectedWorkOrder.value"
    :is-loading="profile.workOrderDetailQuery.isLoading.value"
    :is-closing="profile.closeWorkOrderMutation.isPending.value"
    :is-connected="profile.isChatConnected.value"
    :reply-error="profile.replyError.value"
    @close="profile.closeWorkOrderDetail"
    @reply="profile.submitWorkOrderReply"
    @close-work-order="profile.confirmCloseWorkOrder"
  />
</template>
