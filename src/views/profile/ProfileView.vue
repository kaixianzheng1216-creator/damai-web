<script setup lang="ts">
import ProfilePassengerDialog from '@/components/features/profile/ProfilePassengerDialog.vue'
import ProfilePassengersSection from '@/components/features/profile/ProfilePassengersSection.vue'
import ProfileFollowedEventsSection from '@/components/features/profile/ProfileFollowedEventsSection.vue'
import ProfileFollowedParticipantsSection from '@/components/features/profile/ProfileFollowedParticipantsSection.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ProfileInfoSection from '@/components/features/profile/ProfileInfoSection.vue'
import ProfileOrdersSection from '@/components/features/profile/ProfileOrdersSection.vue'
import ProfileTicketsSection from '@/components/features/profile/ProfileTicketsSection.vue'
import ProfileWorkOrderDetailDialog from '@/components/features/profile/ProfileWorkOrderDetailDialog.vue'
import ProfileWorkOrdersSection from '@/components/features/profile/ProfileWorkOrdersSection.vue'

import ProfileSidebar from '@/components/features/profile/ProfileSidebar.vue'
import ProfileMobileBottomNav from '@/components/features/profile/ProfileMobileBottomNav.vue'
import { PROFILE_DIALOG_COPY } from '@/constants'
import { useProfilePage } from '@/composables/profile/useProfilePage'

const {
  activeSection,
  infoForm,
  passengerList,
  passengerPage,
  passengerPageSize,
  passengerTotalPages,
  passengerTotalRow,
  passengerKeyword,
  showPassengerModal,
  showDeletePassengerModal,
  passengerError,
  passengerForm,
  orderFilter,
  orderPage,
  orderPageSize,
  orderTotalRow,
  ticketPage,
  ticketPageSize,
  ticketTotalRow,
  workOrderFilter,
  workOrderPage,
  workOrderPageSize,
  workOrderTotalRow,
  replyContent,
  replyError,
  showCloseWorkOrderModal,
  years,
  months,
  days,
  tradeSections,
  accountSections,
  currentTitle,
  displayAvatar,
  activeSectionLoading,
  workOrderDetailQuery,
  paginatedOrders,
  paginatedTickets,
  workOrders,
  orderTotalPages,
  ticketTotalPages,
  workOrderTotalPages,
  updateOrderPage,
  updateOrderPageSize,
  updateTicketPage,
  updateTicketPageSize,
  updateWorkOrderPage,
  updateWorkOrderPageSize,
  updatePassengerPage,
  updatePassengerPageSize,
  updatePassengerKeyword,
  openSection,
  saveInfo,
  openCreatePassengerModal,
  closePassengerModal,
  submitPassenger,
  openDeletePassengerModal,
  closeDeletePassengerModal,
  confirmDeletePassenger,
  updateAvatar,
  selectedWorkOrderId,
  selectedWorkOrder,
  replyMutation,
  closeWorkOrderMutation,
  openWorkOrderDetail,
  closeWorkOrderDetail,
  submitWorkOrderReply,
  openCloseWorkOrderModal,
  closeCloseWorkOrderModal,
  confirmCloseWorkOrder,
  followList,
} = useProfilePage()

const allSections = computed(() => [...tradeSections.value, ...accountSections.value])
</script>

<template>
  <div class="bg-background py-4 md:py-6">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid items-start gap-4 lg:gap-6 lg:grid-cols-[240px_1fr]">
        <ProfileSidebar
          class="hidden lg:block"
          :active-section="activeSection"
          :trade-sections="tradeSections"
          :account-sections="accountSections"
          @open-section="openSection"
        />

        <div class="space-y-4">
          <ProfileMobileBottomNav
            :active-section="activeSection"
            :all-sections="allSections"
            @open-section="openSection"
          />

          <section
            class="rounded-2xl border border-border bg-background p-4 md:p-5 lg:p-6 shadow-sm"
          >
            <div v-if="activeSectionLoading" class="flex min-h-[320px] items-center justify-center">
              <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
            </div>

            <template v-else>
              <div
                class="mb-4 md:mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"
              >
                <h1 class="text-lg md:text-xl font-semibold text-foreground">{{ currentTitle }}</h1>
              </div>

              <ProfileInfoSection
                v-if="activeSection === 'info'"
                v-model:form="infoForm"
                :display-avatar="displayAvatar"
                :years="years"
                :months="months"
                :days="days"
                @save="saveInfo"
                @avatar-selected="updateAvatar"
              />

              <ProfilePassengersSection
                v-else-if="activeSection === 'passengers'"
                :passengers="passengerList"
                :passenger-page="passengerPage"
                :passenger-page-size="passengerPageSize"
                :passenger-total-pages="passengerTotalPages"
                :passenger-total-row="passengerTotalRow"
                :passenger-keyword="passengerKeyword"
                @create="openCreatePassengerModal"
                @delete="openDeletePassengerModal"
                @update:passenger-page="updatePassengerPage"
                @update:passenger-page-size="updatePassengerPageSize"
                @update:passenger-keyword="updatePassengerKeyword"
              />

              <ProfileOrdersSection
                v-else-if="activeSection === 'orders'"
                :order-filter="orderFilter"
                :paginated-orders="paginatedOrders"
                :order-page="orderPage"
                :order-page-size="orderPageSize"
                :order-total-pages="orderTotalPages"
                :order-total-row="orderTotalRow"
                @update:order-filter="orderFilter = $event"
                @update:order-page="updateOrderPage"
                @update:order-page-size="updateOrderPageSize"
              />

              <ProfileTicketsSection
                v-else-if="activeSection === 'tickets'"
                :paginated-tickets="paginatedTickets"
                :ticket-page="ticketPage"
                :ticket-page-size="ticketPageSize"
                :ticket-total-pages="ticketTotalPages"
                :ticket-total-row="ticketTotalRow"
                @update:ticket-page="updateTicketPage"
                @update:ticket-page-size="updateTicketPageSize"
              />

              <ProfileWorkOrdersSection
                v-else-if="activeSection === 'work-orders'"
                :work-order-filter="workOrderFilter"
                :work-orders="workOrders"
                :work-order-page="workOrderPage"
                :work-order-page-size="workOrderPageSize"
                :work-order-total-pages="workOrderTotalPages"
                :work-order-total-row="workOrderTotalRow"
                @update:work-order-filter="workOrderFilter = $event"
                @update:work-order-page="updateWorkOrderPage"
                @update:work-order-page-size="updateWorkOrderPageSize"
                @open-detail="openWorkOrderDetail"
              />

              <ProfileFollowedEventsSection
                v-else-if="activeSection === 'followed-events'"
                :paginated-events="followList.paginatedFollowedEvents.value"
                :page="followList.followedEventsPage.value"
                :total-pages="followList.followedEventsTotalPages.value"
                :page-size="followList.followedEventsPageSize.value"
                :total-row="followList.followedEventsTotalRow.value"
                @update:page="followList.updateFollowedEventsPage"
                @update:page-size="followList.updateFollowedEventsPageSize"
                @toggle-follow="followList.handleUnfollowEvent"
              />

              <ProfileFollowedParticipantsSection
                v-else-if="activeSection === 'followed-participants'"
                :paginated-participants="followList.paginatedFollowedParticipants.value"
                :page="followList.followedParticipantsPage.value"
                :total-pages="followList.followedParticipantsTotalPages.value"
                :page-size="followList.followedParticipantsPageSize.value"
                :total-row="followList.followedParticipantsTotalRow.value"
                @update:page="followList.updateFollowedParticipantsPage"
                @update:page-size="followList.updateFollowedParticipantsPageSize"
                @toggle-follow="followList.handleUnfollowParticipant"
              />
            </template>
          </section>
        </div>
      </div>
    </div>

    <ProfilePassengerDialog
      v-model:form="passengerForm"
      :open="showPassengerModal"
      :passenger-error="passengerError"
      @close="closePassengerModal"
      @submit="submitPassenger"
    />

    <ConfirmDialog
      :open="showDeletePassengerModal"
      :title="PROFILE_DIALOG_COPY.deletePassengerTitle"
      :description="PROFILE_DIALOG_COPY.deletePassengerDescription"
      :confirm-text="PROFILE_DIALOG_COPY.deletePassengerConfirmText"
      @close="closeDeletePassengerModal"
      @confirm="confirmDeletePassenger"
    />

    <ProfileWorkOrderDetailDialog
      v-model:reply-content="replyContent"
      :open="!!selectedWorkOrderId"
      :work-order="selectedWorkOrder"
      :is-loading="workOrderDetailQuery.isLoading.value"
      :is-replying="replyMutation.isPending.value"
      :is-closing="closeWorkOrderMutation.isPending.value"
      :reply-error="replyError"
      @close="closeWorkOrderDetail"
      @submit-reply="submitWorkOrderReply"
      @close-work-order="openCloseWorkOrderModal"
    />

    <ConfirmDialog
      :open="showCloseWorkOrderModal"
      :title="PROFILE_DIALOG_COPY.closeWorkOrderTitle"
      :description="PROFILE_DIALOG_COPY.closeWorkOrderDescription"
      :confirm-text="PROFILE_DIALOG_COPY.closeWorkOrderConfirmText"
      @close="closeCloseWorkOrderModal"
      @confirm="confirmCloseWorkOrder"
    />
  </div>
</template>
