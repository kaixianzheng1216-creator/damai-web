import { computed, reactive, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchUserInfo, updateUserInfo } from '@/api/account'
import type { UserVO } from '@/api/account'
import { PROFILE_CONFIG, queryKeys } from '@/constants'
import { useProfileSection } from './useProfileSection'
import { usePassengerManagement } from './usePassengerManagement'
import { useOrderList } from './useOrderList'
import { useTicketList } from './useTicketList'
import { useWorkOrderList } from './useWorkOrderList'
import { useAvatarUpload } from './useAvatarUpload'
import { useFollowList } from './useFollowList'

export const useProfilePage = () => {
  const queryClient = useQueryClient()

  const profileSection = useProfileSection()
  const isInfoSection = computed(() => profileSection.activeSection.value === 'info')
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
  const avatarUpload = useAvatarUpload()
  const followList = useFollowList({
    events: { enabled: isFollowedEventsSection },
    participants: { enabled: isFollowedParticipantsSection },
  })

  const userInfoQuery = useQuery<UserVO>({
    queryKey: queryKeys.profile.userInfo(),
    queryFn: fetchUserInfo,
    enabled: isInfoSection,
  })

  const updateUserInfoMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.userInfo() })
    },
  })

  const activeSectionLoading = computed(() => {
    switch (profileSection.activeSection.value) {
      case 'info':
        return userInfoQuery.isLoading.value
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

  const years = Array.from({ length: PROFILE_CONFIG.YEAR_RANGE }, (_, i) =>
    String(PROFILE_CONFIG.START_YEAR - i),
  )
  const months = Array.from({ length: PROFILE_CONFIG.MONTH_COUNT }, (_, i) => String(i + 1))
  const days = Array.from({ length: PROFILE_CONFIG.DAY_COUNT }, (_, i) => String(i + 1))

  const infoForm = reactive({
    nickname: userInfoQuery.data.value?.username ?? '',
    gender: PROFILE_CONFIG.GENDER_DEFAULT,
    birthYear: PROFILE_CONFIG.BIRTH_YEAR_DEFAULT,
    birthMonth: PROFILE_CONFIG.BIRTH_MONTH_DEFAULT,
    birthDay: PROFILE_CONFIG.BIRTH_DAY_DEFAULT,
  })

  watch(
    () => userInfoQuery.data.value,
    (data) => {
      if (!data) {
        return
      }
      infoForm.nickname = data.username
    },
    { immediate: true },
  )

  const saveInfo = async () => {
    await updateUserInfoMutation.mutateAsync({
      username: infoForm.nickname,
      avatarUrl: avatarUpload.avatarUrl.value || userInfoQuery.data.value?.avatarUrl,
    })
  }

  return {
    activeSection: profileSection.activeSection,
    tradeSections: profileSection.tradeSections,
    accountSections: profileSection.accountSections,
    currentTitle: profileSection.currentTitle,
    openSection: profileSection.openSection,
    activeSectionLoading,
    infoForm,
    saveInfo,
    years,
    months,
    days,
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
    openCreatePassengerModal: passengerManagement.openCreatePassengerModal,
    closePassengerModal: passengerManagement.closePassengerModal,
    submitPassenger: passengerManagement.submitPassenger,
    openDeletePassengerModal: passengerManagement.openDeletePassengerModal,
    closeDeletePassengerModal: passengerManagement.closeDeletePassengerModal,
    confirmDeletePassenger: passengerManagement.confirmDeletePassenger,
    updatePassengerPage: passengerManagement.updatePassengerPage,
    updatePassengerPageSize: passengerManagement.updatePassengerPageSize,
    updatePassengerKeyword: passengerManagement.updatePassengerKeyword,
    orderFilter: orderList.orderFilter,
    orderPage: orderList.orderPage,
    orderPageSize: orderList.orderPageSize,
    myOrderPageQuery: orderList.myOrderPageQuery,
    paginatedOrders: orderList.paginatedOrders,
    orderTotalPages: orderList.orderTotalPages,
    orderTotalRow: orderList.orderTotalRow,
    updateOrderPage: orderList.updateOrderPage,
    updateOrderPageSize: orderList.updateOrderPageSize,
    ticketPage: ticketList.ticketPage,
    ticketPageSize: ticketList.ticketPageSize,
    myTicketPageQuery: ticketList.myTicketPageQuery,
    paginatedTickets: ticketList.ticketList,
    ticketTotalPages: ticketList.ticketTotalPages,
    ticketTotalRow: ticketList.ticketTotalRow,
    updateTicketPage: ticketList.updateTicketPage,
    updateTicketPageSize: ticketList.updateTicketPageSize,
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
    showCloseWorkOrderModal: workOrderList.showCloseWorkOrderModal,
    updateWorkOrderPage: workOrderList.updateWorkOrderPage,
    updateWorkOrderPageSize: workOrderList.updateWorkOrderPageSize,
    openWorkOrderDetail: workOrderList.openWorkOrderDetail,
    closeWorkOrderDetail: workOrderList.closeWorkOrderDetail,
    submitWorkOrderReply: workOrderList.submitWorkOrderReply,
    openCloseWorkOrderModal: workOrderList.openCloseWorkOrderModal,
    closeCloseWorkOrderModal: workOrderList.closeCloseWorkOrderModal,
    confirmCloseWorkOrder: workOrderList.confirmCloseWorkOrder,
    userInfoQuery,
    displayAvatar: avatarUpload.displayAvatar,
    updateAvatar: avatarUpload.updateAvatar,
    // Follow List (直接导出整个对象以避免参数蔓延)
    followList,
  }
}
