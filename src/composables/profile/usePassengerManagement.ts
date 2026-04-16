import { computed, reactive, ref } from 'vue'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchPassengerPage, createPassenger, deletePassenger } from '@/api/account'
import { PASSENGER_CERT_TYPES } from '@/constants'
import { mapPassengerToPassengerItem } from '@/utils/mappers'
import type { PassengerItem, PassengerFormData } from '@/api/account'
import type { PageResponsePassengerVO } from '@/api/account'

const passengerSchema = z.object({
  name: z.string().trim().min(1, '请输入姓名'),
  certNo: z.string().trim().min(1, '请输入证件号'),
})

export const usePassengerManagement = () => {
  const queryClient = useQueryClient()

  const showPassengerModal = ref(false)
  const showDeletePassengerModal = ref(false)

  const editingPassengerId = ref<string | null>(null)
  const deletingPassengerId = ref<string | null>(null)

  const passengerError = ref('')

  const passengerForm = reactive<PassengerFormData>({
    name: '',
    certType: PASSENGER_CERT_TYPES[0],
    certNo: '',
  })

  const passengerPage = ref(1)
  const passengerPageSize = ref(10)
  const passengerKeyword = ref('')

  const passengerListQuery = useQuery<PageResponsePassengerVO>({
    queryKey: ['passenger-list', passengerPage, passengerPageSize, passengerKeyword],
    queryFn: () =>
      fetchPassengerPage({
        page: passengerPage.value,
        size: passengerPageSize.value,
        name: passengerKeyword.value || undefined,
      }),
  })

  const passengerList = computed<PassengerItem[]>(() => {
    return passengerListQuery.data.value?.records?.map(mapPassengerToPassengerItem) ?? []
  })

  const passengerTotalPages = computed(() => passengerListQuery.data.value?.totalPage ?? 1)

  const passengerTotalRow = computed(() => {
    return passengerListQuery.data.value?.totalRow ?? 0
  })

  const refreshPassengerList = () => queryClient.invalidateQueries({ queryKey: ['passenger-list'] })

  const createPassengerMutation = useMutation({
    mutationFn: createPassenger,
    onSuccess: refreshPassengerList,
  })
  const deletePassengerMutation = useMutation({
    mutationFn: deletePassenger,
    onSuccess: refreshPassengerList,
  })

  const resetPassengerForm = () => {
    Object.assign(passengerForm, {
      name: '',
      certType: PASSENGER_CERT_TYPES[0],
      certNo: '',
    })
    passengerError.value = ''
    editingPassengerId.value = null
  }

  const openCreatePassengerModal = () => {
    resetPassengerForm()
    showPassengerModal.value = true
  }

  const openEditPassengerModal = (passenger: PassengerItem) => {
    editingPassengerId.value = passenger.id
    Object.assign(passengerForm, {
      name: passenger.name,
      certType: passenger.certType,
      certNo: passenger.certNo,
    })
    passengerError.value = ''
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

    const idType = PASSENGER_CERT_TYPES.findIndex((t) => t === passengerForm.certType)

    try {
      await createPassengerMutation.mutateAsync({
        name: result.data.name,
        idType: idType === -1 ? 1 : idType + 1,
        idNo: result.data.certNo,
      })
      closePassengerModal()
    } catch {
      passengerError.value = '保存失败，请重试'
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

  const updatePassengerPage = (page: number) => {
    passengerPage.value = page
  }

  const updatePassengerPageSize = (pageSize: number) => {
    if (pageSize < 1) {
      return
    }

    passengerPageSize.value = pageSize
    passengerPage.value = 1
  }

  const updatePassengerKeyword = (keyword: string) => {
    passengerKeyword.value = keyword
    passengerPage.value = 1
  }

  return {
    passengerListQuery,
    passengerList,
    passengerPage,
    passengerPageSize,
    passengerTotalPages,
    passengerTotalRow,
    passengerKeyword,
    showPassengerModal,
    showDeletePassengerModal,
    editingPassengerId,
    passengerError,
    passengerForm,
    openCreatePassengerModal,
    openEditPassengerModal,
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
