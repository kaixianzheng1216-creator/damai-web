import { computed } from 'vue'
import { useProfileSection } from './useProfileSection'
import { usePassengerManagement } from './usePassengerManagement'
import { useOrderList } from './useOrderList'
import { useTicketList } from './useTicketList'
import { useWorkOrderList } from './useWorkOrderList'
import { useFollowList } from './useFollowList'
import { useProfileUserInfo } from './useProfileUserInfo'

export const useProfilePage = () => {
  const profileSection = useProfileSection()
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

  return {
    activeSection: profileSection.activeSection,
    tradeSections: profileSection.tradeSections,
    accountSections: profileSection.accountSections,
    currentTitle: profileSection.currentTitle,
    openSection: profileSection.openSection,
    activeSectionLoading,
    // User info
    infoForm: userInfo.infoForm,
    saveInfo: userInfo.saveInfo,
    years: userInfo.years,
    months: userInfo.months,
    days: userInfo.days,
    userInfoQuery: userInfo.userInfoQuery,
    updateUserInfoMutation: userInfo.updateUserInfoMutation,
    displayAvatar: userInfo.displayAvatar,
    updateAvatar: userInfo.updateAvatar,
    // Passenger
    passengerList: passengerManagement.passengerList,
    passengerPage: passengerManagement.passengerPage,
    passengerPageSize: passengerManagement.passengerPageSize,
    passengerTotalPages: passengerManagement.passengerTotalPages,
    passengerTotalRow: passengerManagement.passengerTotalRow,
    passengerKeyword: passengerManagement.passengerKeyword,
    showPassengerModal: passengerManagement.showPassengerModal,
    showDeletePassengerModal: passengerManagement.showDeletePassengerModal,
    passengerError: passengerManagement.passengerError,
    passengerForm: passengerManagement.passengerForm,
    passengerListQuery: passengerManagement.passengerListQuery,
    createPassengerMutation: passengerManagement.createPassengerMutation,
    deletePassengerMutation: passengerManagement.deletePassengerMutation,
    openCreatePassengerModal: passengerManagement.openCreatePassengerModal,
    closePassengerModal: passengerManagement.closePassengerModal,
    submitPassenger: passengerManagement.submitPassenger,
    openDeletePassengerModal: passengerManagement.openDeletePassengerModal,
    closeDeletePassengerModal: passengerManagement.closeDeletePassengerModal,
    confirmDeletePassenger: passengerManagement.confirmDeletePassenger,
    updatePassengerPage: passengerManagement.updatePassengerPage,
    updatePassengerPageSize: passengerManagement.updatePassengerPageSize,
    updatePassengerKeyword: passengerManagement.updatePassengerKeyword,
    // Order
    orderFilter: orderList.orderFilter,
    orderPage: orderList.orderPage,
    orderPageSize: orderList.orderPageSize,
    myOrderPageQuery: orderList.myOrderPageQuery,
    paginatedOrders: orderList.paginatedOrders,
    orderTotalPages: orderList.orderTotalPages,
    orderTotalRow: orderList.orderTotalRow,
    updateOrderPage: orderList.updateOrderPage,
    updateOrderPageSize: orderList.updateOrderPageSize,
    // Ticket
    ticketPage: ticketList.ticketPage,
    ticketPageSize: ticketList.ticketPageSize,
    myTicketPageQuery: ticketList.myTicketPageQuery,
    paginatedTickets: ticketList.ticketList,
    ticketTotalPages: ticketList.ticketTotalPages,
    ticketTotalRow: ticketList.ticketTotalRow,
    updateTicketPage: ticketList.updateTicketPage,
    updateTicketPageSize: ticketList.updateTicketPageSize,
    // Work order
    workOrderFilter: workOrderList.workOrderFilter,
    workOrderPage: workOrderList.workOrderPage,
    workOrderPageSize: workOrderList.workOrderPageSize,
    workOrderListQuery: workOrderList.workOrderListQuery,
    workOrders: workOrderList.workOrders,
    workOrderTotalPages: workOrderList.workOrderTotalPages,
    workOrderTotalRow: workOrderList.workOrderTotalRow,
    selectedWorkOrderId: workOrderList.selectedWorkOrderId,
    selectedWorkOrder: workOrderList.selectedWorkOrder,
    workOrderDetailQuery: workOrderList.workOrderDetailQuery,
    replyContent: workOrderList.replyContent,
    replyError: workOrderList.replyError,
    replyMutation: workOrderList.replyMutation,
    closeWorkOrderMutation: workOrderList.closeWorkOrderMutation,
    updateWorkOrderPage: workOrderList.updateWorkOrderPage,
    updateWorkOrderPageSize: workOrderList.updateWorkOrderPageSize,
    openWorkOrderDetail: workOrderList.openWorkOrderDetail,
    closeWorkOrderDetail: workOrderList.closeWorkOrderDetail,
    submitWorkOrderReply: workOrderList.submitWorkOrderReply,
    confirmCloseWorkOrder: workOrderList.confirmCloseWorkOrder,
    // Follow
    followList,
  }
}

export type ProfilePageState = ReturnType<typeof useProfilePage>
