<script setup lang="ts">
import ProfileFollowedEventsSection from './ProfileFollowedEventsSection.vue'
import ProfileFollowedParticipantsSection from './ProfileFollowedParticipantsSection.vue'
import ProfileInfoSection from './ProfileInfoSection.vue'
import ProfileOrdersSection from './ProfileOrdersSection.vue'
import ProfilePassengersSection from './ProfilePassengersSection.vue'
import ProfileTicketsSection from './ProfileTicketsSection.vue'
import ProfileWorkOrdersSection from './ProfileWorkOrdersSection.vue'
import { useProfilePageContext } from './profilePageContext'

const profile = useProfilePageContext()
</script>

<template>
  <ProfileInfoSection
    v-if="profile.activeSection.value === 'info'"
    v-model:form="profile.infoForm"
    :display-avatar="profile.displayAvatar.value"
    :years="profile.years"
    :months="profile.months"
    :days="profile.days"
    @save="profile.saveInfo"
    @avatar-selected="profile.updateAvatar"
  />

  <ProfilePassengersSection
    v-else-if="profile.activeSection.value === 'passengers'"
    :passengers="profile.passengerList.value"
    :passenger-page="profile.passengerPage.value"
    :passenger-page-size="profile.passengerPageSize.value"
    :passenger-total-pages="profile.passengerTotalPages.value"
    :passenger-total-row="profile.passengerTotalRow.value"
    :passenger-keyword="profile.passengerKeyword.value"
    @create="profile.openCreatePassengerModal"
    @delete="profile.openDeletePassengerModal"
    @update:passenger-page="profile.updatePassengerPage"
    @update:passenger-page-size="profile.updatePassengerPageSize"
    @update:passenger-keyword="profile.updatePassengerKeyword"
  />

  <ProfileOrdersSection
    v-else-if="profile.activeSection.value === 'orders'"
    :order-filter="profile.orderFilter.value"
    :paginated-orders="profile.paginatedOrders.value"
    :order-page="profile.orderPage.value"
    :order-page-size="profile.orderPageSize.value"
    :order-total-pages="profile.orderTotalPages.value"
    :order-total-row="profile.orderTotalRow.value"
    @update:order-filter="profile.orderFilter.value = $event"
    @update:order-page="profile.updateOrderPage"
    @update:order-page-size="profile.updateOrderPageSize"
  />

  <ProfileTicketsSection
    v-else-if="profile.activeSection.value === 'tickets'"
    :paginated-tickets="profile.paginatedTickets.value"
    :ticket-page="profile.ticketPage.value"
    :ticket-page-size="profile.ticketPageSize.value"
    :ticket-total-pages="profile.ticketTotalPages.value"
    :ticket-total-row="profile.ticketTotalRow.value"
    @update:ticket-page="profile.updateTicketPage"
    @update:ticket-page-size="profile.updateTicketPageSize"
  />

  <ProfileWorkOrdersSection
    v-else-if="profile.activeSection.value === 'work-orders'"
    :work-order-filter="profile.workOrderFilter.value"
    :work-orders="profile.workOrders.value"
    :work-order-page="profile.workOrderPage.value"
    :work-order-page-size="profile.workOrderPageSize.value"
    :work-order-total-pages="profile.workOrderTotalPages.value"
    :work-order-total-row="profile.workOrderTotalRow.value"
    @update:work-order-filter="profile.workOrderFilter.value = $event"
    @update:work-order-page="profile.updateWorkOrderPage"
    @update:work-order-page-size="profile.updateWorkOrderPageSize"
    @open-detail="profile.openWorkOrderDetail"
  />

  <ProfileFollowedEventsSection
    v-else-if="profile.activeSection.value === 'followed-events'"
    :paginated-events="profile.followList.paginatedFollowedEvents.value"
    :page="profile.followList.followedEventsPage.value"
    :total-pages="profile.followList.followedEventsTotalPages.value"
    :page-size="profile.followList.followedEventsPageSize.value"
    :total-row="profile.followList.followedEventsTotalRow.value"
    @update:page="profile.followList.updateFollowedEventsPage"
    @update:page-size="profile.followList.updateFollowedEventsPageSize"
    @toggle-follow="profile.followList.handleUnfollowEvent"
  />

  <ProfileFollowedParticipantsSection
    v-else-if="profile.activeSection.value === 'followed-participants'"
    :paginated-participants="profile.followList.paginatedFollowedParticipants.value"
    :page="profile.followList.followedParticipantsPage.value"
    :total-pages="profile.followList.followedParticipantsTotalPages.value"
    :page-size="profile.followList.followedParticipantsPageSize.value"
    :total-row="profile.followList.followedParticipantsTotalRow.value"
    @update:page="profile.followList.updateFollowedParticipantsPage"
    @update:page-size="profile.followList.updateFollowedParticipantsPageSize"
    @toggle-follow="profile.followList.handleUnfollowParticipant"
  />
</template>
