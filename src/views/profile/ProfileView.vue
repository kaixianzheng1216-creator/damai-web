<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ProfileDialogs,
  ProfilePageShell,
  ProfileSectionContent,
} from '@/components/features/profile'
import { logout } from '@/api/account'
import { useProfileSection } from '@/composables/profile/useProfileSection'
import { usePassengerManagement } from '@/composables/profile/usePassengerManagement'
import { useOrderList } from '@/composables/profile/useOrderList'
import { useTicketList } from '@/composables/profile/useTicketList'
import { useWorkOrderList } from '@/composables/profile/useWorkOrderList'
import { useFollowList } from '@/composables/profile/useFollowList'
import { useProfileUserInfo } from '@/composables/profile/useProfileUserInfo'
import type { OrderFilterKey, WorkOrderFilterKey } from '@/constants'
import { useUserStore } from '@/stores/user'

const profileSection = useProfileSection()
const router = useRouter()
const userStore = useUserStore()

const isPassengersSection = computed(() => profileSection.activeSection.value === 'passengers')
const isOrdersSection = computed(() => profileSection.activeSection.value === 'orders')
const isTicketsSection = computed(() => profileSection.activeSection.value === 'tickets')
const isWorkOrdersSection = computed(() => profileSection.activeSection.value === 'work-orders')
const isFollowedEventsSection = computed(
  () => profileSection.activeSection.value === 'followed-events',
)
const isFollowedParticipantsSection = computed(
  () => profileSection.activeSection.value === 'followed-participants',
)

const passengerManagement = usePassengerManagement({ enabled: isPassengersSection })
const orderList = useOrderList({ enabled: isOrdersSection })
const ticketList = useTicketList({ enabled: isTicketsSection })
const workOrderList = useWorkOrderList({ enabled: isWorkOrdersSection })
const userInfo = useProfileUserInfo()
const followList = useFollowList({
  events: { enabled: isFollowedEventsSection },
  participants: { enabled: isFollowedParticipantsSection },
})

const activeSectionLoading = computed(() => {
  switch (profileSection.activeSection.value) {
    case 'info':
      return userInfo.userInfoQuery.isLoading.value
    case 'passengers':
      return passengerManagement.passengerListQuery.isLoading.value
    case 'orders':
      return orderList.myOrderPageQuery.isLoading.value
    case 'tickets':
      return ticketList.myTicketPageQuery.isLoading.value
    case 'work-orders':
      return workOrderList.workOrderListQuery.isLoading.value
    case 'followed-events':
      return followList.followedEventsQuery.isLoading.value
    case 'followed-participants':
      return followList.followedParticipantsQuery.isLoading.value
    default:
      return false
  }
})

const updateOrderFilter = (value: OrderFilterKey) => {
  orderList.orderFilter.value = value
}

const updateWorkOrderFilter = (value: WorkOrderFilterKey) => {
  workOrderList.workOrderFilter.value = value
}

const updateWorkOrderReplyContent = (value: string) => {
  workOrderList.replyContent.value = value
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('[ProfileView] Logout failed:', error)
  } finally {
    userStore.clearUserInfo()
    await router.push('/')
  }
}
</script>

<template>
  <ProfilePageShell
    :active-section="profileSection.activeSection.value"
    :trade-sections="profileSection.tradeSections.value"
    :account-sections="profileSection.accountSections.value"
    :current-title="profileSection.currentTitle.value"
    :active-section-loading="activeSectionLoading"
    @open-section="profileSection.openSection"
    @logout="handleLogout"
  >
    <ProfileSectionContent
      :active-section="profileSection.activeSection.value"
      :user-info="userInfo"
      :passenger-management="passengerManagement"
      :order-list="orderList"
      :ticket-list="ticketList"
      :work-order-list="workOrderList"
      :follow-list="followList"
      @update:order-filter="updateOrderFilter"
      @update:work-order-filter="updateWorkOrderFilter"
    />
  </ProfilePageShell>

  <ProfileDialogs
    :passenger-management="passengerManagement"
    :work-order-list="workOrderList"
    @update:reply-content="updateWorkOrderReplyContent"
  />
</template>
