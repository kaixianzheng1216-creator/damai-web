<script setup lang="ts">
import ProfileFollowedEventsSection from './ProfileFollowedEventsSection.vue'
import ProfileFollowedParticipantsSection from './ProfileFollowedParticipantsSection.vue'
import ProfileInfoSection from './ProfileInfoSection.vue'
import ProfileOrdersSection from './ProfileOrdersSection.vue'
import ProfilePassengersSection from './ProfilePassengersSection.vue'
import ProfileTicketsSection from './ProfileTicketsSection.vue'
import ProfileWorkOrdersSection from './ProfileWorkOrdersSection.vue'
import type { ProfileSectionKey } from '@/constants'
import type { usePassengerManagement } from '@/composables/profile/usePassengerManagement'
import type { useOrderList } from '@/composables/profile/useOrderList'
import type { useTicketList } from '@/composables/profile/useTicketList'
import type { useWorkOrderList } from '@/composables/profile/useWorkOrderList'
import type { useFollowList } from '@/composables/profile/useFollowList'
import type { useProfileUserInfo } from '@/composables/profile/useProfileUserInfo'

type PassengerManagementState = ReturnType<typeof usePassengerManagement>
type OrderListState = ReturnType<typeof useOrderList>
type TicketListState = ReturnType<typeof useTicketList>
type WorkOrderListState = ReturnType<typeof useWorkOrderList>
type FollowListState = ReturnType<typeof useFollowList>
type UserInfoState = ReturnType<typeof useProfileUserInfo>

defineProps<{
  activeSection: ProfileSectionKey
  userInfo: UserInfoState
  passengerManagement: PassengerManagementState
  orderList: OrderListState
  ticketList: TicketListState
  workOrderList: WorkOrderListState
  followList: FollowListState
}>()
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <ProfileInfoSection
    v-if="activeSection === 'info'"
    v-model:form="userInfo.infoForm"
    :display-avatar="userInfo.displayAvatar.value"
    :years="userInfo.years"
    :months="userInfo.months"
    :days="userInfo.days"
    @save="userInfo.saveInfo"
    @avatar-selected="userInfo.updateAvatar"
  />

  <ProfilePassengersSection
    v-else-if="activeSection === 'passengers'"
    :passengers="passengerManagement.passengerList.value"
    :passenger-page="passengerManagement.passengerPage.value"
    :passenger-page-size="passengerManagement.passengerPageSize.value"
    :passenger-total-pages="passengerManagement.passengerTotalPages.value"
    :passenger-total-row="passengerManagement.passengerTotalRow.value"
    :passenger-keyword="passengerManagement.passengerKeyword.value"
    @create="passengerManagement.openCreatePassengerModal"
    @delete="passengerManagement.openDeletePassengerModal"
    @update:passenger-page="passengerManagement.updatePassengerPage"
    @update:passenger-page-size="passengerManagement.updatePassengerPageSize"
    @update:passenger-keyword="passengerManagement.updatePassengerKeyword"
  />

  <ProfileOrdersSection
    v-else-if="activeSection === 'orders'"
    :order-filter="orderList.orderFilter.value"
    :paginated-orders="orderList.paginatedOrders.value"
    :order-page="orderList.orderPage.value"
    :order-page-size="orderList.orderPageSize.value"
    :order-total-pages="orderList.orderTotalPages.value"
    :order-total-row="orderList.orderTotalRow.value"
    @update:order-filter="orderList.orderFilter.value = $event"
    @update:order-page="orderList.updateOrderPage"
    @update:order-page-size="orderList.updateOrderPageSize"
  />

  <ProfileTicketsSection
    v-else-if="activeSection === 'tickets'"
    :paginated-tickets="ticketList.ticketList.value"
    :ticket-page="ticketList.ticketPage.value"
    :ticket-page-size="ticketList.ticketPageSize.value"
    :ticket-total-pages="ticketList.ticketTotalPages.value"
    :ticket-total-row="ticketList.ticketTotalRow.value"
    @update:ticket-page="ticketList.updateTicketPage"
    @update:ticket-page-size="ticketList.updateTicketPageSize"
  />

  <ProfileWorkOrdersSection
    v-else-if="activeSection === 'work-orders'"
    :work-order-filter="workOrderList.workOrderFilter.value"
    :work-orders="workOrderList.workOrders.value"
    :work-order-page="workOrderList.workOrderPage.value"
    :work-order-page-size="workOrderList.workOrderPageSize.value"
    :work-order-total-pages="workOrderList.workOrderTotalPages.value"
    :work-order-total-row="workOrderList.workOrderTotalRow.value"
    @update:work-order-filter="workOrderList.workOrderFilter.value = $event"
    @update:work-order-page="workOrderList.updateWorkOrderPage"
    @update:work-order-page-size="workOrderList.updateWorkOrderPageSize"
    @open-detail="workOrderList.openWorkOrderDetail"
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
  <!-- eslint-enable vue/no-mutating-props -->
</template>
