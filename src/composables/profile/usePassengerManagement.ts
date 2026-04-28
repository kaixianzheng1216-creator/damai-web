import { computed, reactive, ref } from 'vue'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchPassengerPage, createPassenger, deletePassenger } from '@/api/account'
import { PASSENGER_CERT_TYPES } from '@/constants'
import { mapPassengerToPassengerItem } from '@/utils/mappers'
import { queryKeys } from '@/constants'
import { usePagination, useQueryEnabled, type QueryEnabledOptions } from '@/composables/common'
import type { PassengerItem, PassengerFormData, PageResponsePassengerVO } from '@/api/account'

const passengerSchema = z.object({
  name: z.string().trim().min(1, '请输入姓名'),
  certNo: z.string().trim().min(1, '请输入证件号'),
})

export const usePassengerManagement = (options: QueryEnabledOptions = {}) => {
  const enabled = useQueryEnabled(options.enabled)
  const queryClient = useQueryClient()

  const showPassengerModal = ref(false)
  const showDeletePassengerModal = ref(false)

  const deletingPassengerId = ref<string | null>(null)

  const passengerError = ref('')

  const passengerForm = reactive<PassengerFormData>({
    name: '',
    certType: PASSENGER_CERT_TYPES[0],
    certNo: '',
  })

  const passengerKeyword = ref('')

  const {
    page: passengerPage,
    pageSize: passengerPageSize,
    updatePage: updatePassengerPage,
    updatePageSize: updatePassengerPageSize,
    getPaginationParams,
    getRecords,
    getTotalPages,
    getTotalRow,
  } = usePagination({
    initialPageSize: 10,
    resetTriggers: [passengerKeyword],
  })

  const passengerListQuery = useQuery<PageResponsePassengerVO>({
    queryKey: queryKeys.profile.passengers(passengerPage, passengerPageSize, passengerKeyword),
    queryFn: () =>
      fetchPassengerPage({
        ...getPaginationParams(),
        name: passengerKeyword.value || undefined,
      }),
    enabled,
  })

  const passengerList = computed<PassengerItem[]>(() => {
    return getRecords(passengerListQuery.data).value.map(mapPassengerToPassengerItem) ?? []
  })

  const passengerTotalPages = getTotalPages(passengerListQuery.data)
  const passengerTotalRow = getTotalRow(passengerListQuery.data)

  const refreshPassengerList = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.passengers() })

  const createPassengerMutation = useMutation({
    mutationFn: createPassenger,
    onSuccess: refreshPassengerList,
    onError: () => {
      passengerError.value = '添加失败，请重试'
    },
  })

  const deletePassengerMutation = useMutation({
    mutationFn: deletePassenger,
    onSuccess: refreshPassengerList,
    onError: () => {
      passengerError.value = '删除失败，请重试'
    },
  })

  const resetPassengerForm = () => {
    Object.assign(passengerForm, {
      name: '',
      certType: PASSENGER_CERT_TYPES[0],
      certNo: '',
    })
    passengerError.value = ''
  }

  const openCreatePassengerModal = () => {
    resetPassengerForm()
    showPassengerModal.value = true
  }

  const closePassengerModal = () => {
    showPassengerModal.value = false
    resetPassengerForm()
  }

  const submitPassenger = async () => {
    const result = passengerSchema.safeParse(passengerForm)
    if (!result.success) {
      passengerError.value = result.error?.issues?.[0]?.message ?? ''
      return
    }

    const requestData = {
      name: result.data.name,
      idType: 1,
      idNo: result.data.certNo,
    }

    try {
      await createPassengerMutation.mutateAsync(requestData)
      closePassengerModal()
    } catch {
      // Error handled by mutation onError
    }
  }

  const openDeletePassengerModal = (passengerId: string) => {
    deletingPassengerId.value = passengerId
    showDeletePassengerModal.value = true
  }

  const closeDeletePassengerModal = () => {
    showDeletePassengerModal.value = false
    deletingPassengerId.value = null
  }

  const confirmDeletePassenger = async () => {
    if (deletingPassengerId.value == null) {
      return
    }

    await deletePassengerMutation.mutateAsync(deletingPassengerId.value)
    closeDeletePassengerModal()
  }

  const updatePassengerKeyword = (keyword: string) => {
    passengerKeyword.value = keyword
  }

  return {
    passengerListQuery,
    deletePassengerMutation,
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
    openCreatePassengerModal,
    closePassengerModal,
    submitPassenger,
    openDeletePassengerModal,
    closeDeletePassengerModal,
    confirmDeletePassenger,
    updatePassengerPage,
    updatePassengerPageSize,
    updatePassengerKeyword,
  }
}
