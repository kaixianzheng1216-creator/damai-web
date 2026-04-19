import { computed, reactive, ref } from 'vue'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  fetchPassengerPage,
  createPassenger,
  updatePassenger,
  deletePassenger,
} from '@/api/account'
import { PASSENGER_CERT_TYPES } from '@/constants'
import { mapPassengerToPassengerItem } from '@/utils/mappers'
import { usePagination } from '@/composables/common'
import type { PassengerItem, PassengerFormData, PageResponsePassengerVO } from '@/api/account'

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
    resetPage,
  } = usePagination({
    initialPageSize: 10,
    resetTriggers: [passengerKeyword],
  })

  const passengerListQuery = useQuery<PageResponsePassengerVO>({
    queryKey: ['passenger-list', passengerPage, passengerPageSize, passengerKeyword],
    queryFn: () =>
      fetchPassengerPage({
        ...getPaginationParams(),
        name: passengerKeyword.value || undefined,
      }),
  })

  const passengerList = computed<PassengerItem[]>(() => {
    return getRecords(passengerListQuery.data).value.map(mapPassengerToPassengerItem) ?? []
  })

  const passengerTotalPages = getTotalPages(passengerListQuery.data)
  const passengerTotalRow = getTotalRow(passengerListQuery.data)

  const refreshPassengerList = () => queryClient.invalidateQueries({ queryKey: ['passenger-list'] })

  const createPassengerMutation = useMutation({
    mutationFn: createPassenger,
    onSuccess: refreshPassengerList,
    onError: () => {
      passengerError.value = '添加失败，请重试'
    },
  })

  const updatePassengerMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name: string; idType: number; idNo: string }
    }) => updatePassenger(id, data),
    onSuccess: refreshPassengerList,
    onError: () => {
      passengerError.value = '更新失败，请重试'
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

    const requestData = {
      name: result.data.name,
      idType: 1,
      idNo: result.data.certNo,
    }

    try {
      if (editingPassengerId.value) {
        await updatePassengerMutation.mutateAsync({
          id: editingPassengerId.value,
          data: requestData,
        })
      } else {
        await createPassengerMutation.mutateAsync(requestData)
      }
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
