<script setup lang="ts">
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { PROFILE_DIALOG_COPY } from '@/constants'
import ProfilePassengerDialog from './ProfilePassengerDialog.vue'
import ProfileWorkOrderDetailDialog from './ProfileWorkOrderDetailDialog.vue'
import { useProfilePageContext } from './profilePageContext'

const profile = useProfilePageContext()
</script>

<template>
  <ProfilePassengerDialog
    v-model:form="profile.passengerForm"
    :open="profile.showPassengerModal.value"
    :passenger-error="profile.passengerError.value"
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
    :is-replying="profile.replyMutation.isPending.value"
    :is-closing="profile.closeWorkOrderMutation.isPending.value"
    :reply-error="profile.replyError.value"
    @close="profile.closeWorkOrderDetail"
    @submit-reply="profile.submitWorkOrderReply"
    @close-work-order="profile.openCloseWorkOrderModal"
  />

  <ConfirmDialog
    :open="profile.showCloseWorkOrderModal.value"
    :title="PROFILE_DIALOG_COPY.closeWorkOrderTitle"
    :description="PROFILE_DIALOG_COPY.closeWorkOrderDescription"
    :confirm-text="PROFILE_DIALOG_COPY.closeWorkOrderConfirmText"
    confirm-variant="destructive"
    :loading="profile.closeWorkOrderMutation.isPending.value"
    @close="profile.closeCloseWorkOrderModal"
    @confirm="profile.confirmCloseWorkOrder"
  />
</template>
