import { reactive, ref } from 'vue'
import { z } from 'zod'
import { useMutation } from '@tanstack/vue-query'
import { useRefreshPassengerList } from './usePassengerRefresh'
import { createPassenger } from '@/api/account'
import { PASSENGER_CERT_TYPES } from '@/constants'
import { useDialog } from '@/composables/common'
import type { PassengerFormData } from '@/api/account'

const passengerSchema = z.object({
  name: z.string().trim().min(1, '请输入姓名'),
  certNo: z.string().trim().min(1, '请输入证件号'),
})

export const usePassengerForm = () => {
  const {
    open: showPassengerModal,
    openDialog: openPassengerDialog,
    closeDialog: closePassengerModal,
  } = useDialog()

  const passengerError = ref('')

  const passengerForm = reactive<PassengerFormData>({
    name: '',
    certType: PASSENGER_CERT_TYPES.ID_CARD.label,
    certNo: '',
  })

  const resetPassengerForm = () => {
    Object.assign(passengerForm, {
      name: '',
      certType: PASSENGER_CERT_TYPES.ID_CARD.label,
      certNo: '',
    })
    passengerError.value = ''
  }

  const openCreatePassengerModal = () => {
    resetPassengerForm()
    openPassengerDialog()
  }

  const closePassengerModalSafe = () => {
    closePassengerModal()
    resetPassengerForm()
  }

  const refreshPassengerList = useRefreshPassengerList()

  const createPassengerMutation = useMutation({
    mutationFn: createPassenger,
    onSuccess: refreshPassengerList,
    onError: () => {
      passengerError.value = '添加失败，请重试'
    },
  })

  const submitPassenger = async () => {
    const result = passengerSchema.safeParse(passengerForm)
    if (!result.success) {
      passengerError.value = result.error?.issues?.[0]?.message ?? ''
      return
    }

    const requestData = {
      name: result.data.name,
      idType: PASSENGER_CERT_TYPES.ID_CARD.value,
      idNo: result.data.certNo,
    }

    try {
      await createPassengerMutation.mutateAsync(requestData)
      closePassengerModalSafe()
    } catch {
      // Error handled by mutation onError
    }
  }

  return {
    showPassengerModal,
    passengerError,
    passengerForm,
    openCreatePassengerModal,
    closePassengerModal: closePassengerModalSafe,
    submitPassenger,
    createPassengerMutation,
  }
}
