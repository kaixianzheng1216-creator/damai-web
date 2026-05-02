import { computed, reactive, ref, type Ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { createServiceOption, deleteServiceOption, updateServiceOption } from '@/api/event/service'
import type {
  ServiceGuaranteeOptionVO,
  ServiceGuaranteeVO,
  ServiceOptionCreateRequest,
  ServiceOptionUpdateRequest,
} from '@/api/event'
import { BOOLEAN_TYPE } from '@/constants'

export function useServiceOptions(
  invalidate: () => Promise<void>,
  selectedService: Ref<ServiceGuaranteeVO | null>,
  list: Ref<ServiceGuaranteeVO[]>,
  openConfirm: (title: string, description: string, onConfirm: () => void | Promise<void>) => void,
) {
  const showOptionsDialog = ref(false)
  const showOptionDialog = ref(false)
  const editingOptionId = ref<string | null>(null)
  const optionForm = reactive<ServiceOptionCreateRequest & ServiceOptionUpdateRequest>({
    name: '',
    description: '',
    isBooleanType: BOOLEAN_TYPE.NO,
  })

  const optionDialogTitle = computed(() => (editingOptionId.value ? '编辑选项' : '新建选项'))

  const resetOptionForm = () => {
    optionForm.name = ''
    optionForm.description = ''
    optionForm.isBooleanType = BOOLEAN_TYPE.NO
  }

  const openManageOptions = (row: ServiceGuaranteeVO) => {
    const fresh = list.value.find((service) => service.id === row.id)
    selectedService.value = fresh ?? row
    showOptionsDialog.value = true
  }

  const openCreateOption = () => {
    resetOptionForm()
    editingOptionId.value = null
    showOptionDialog.value = true
  }

  const openEditOption = (row: ServiceGuaranteeOptionVO) => {
    optionForm.name = row.name
    optionForm.description = row.description
    optionForm.isBooleanType = row.isBooleanType
    editingOptionId.value = row.id
    showOptionDialog.value = true
  }

  const createOptionMutation = useMutation({
    mutationFn: (payload: ServiceOptionCreateRequest) => {
      const serviceId = selectedService.value?.id
      if (!serviceId) {
        throw new Error('Missing selected service')
      }
      return createServiceOption(serviceId, payload)
    },
    onSuccess: () => {
      invalidate()
      showOptionDialog.value = false
    },
  })

  const updateOptionMutation = useMutation({
    mutationFn: ({ optionId, data }: { optionId: string; data: ServiceOptionUpdateRequest }) => {
      const serviceId = selectedService.value?.id
      if (!serviceId) {
        throw new Error('Missing selected service')
      }
      return updateServiceOption(serviceId, optionId, data)
    },
    onSuccess: () => {
      invalidate()
      showOptionDialog.value = false
    },
  })

  const deleteOptionMutation = useMutation({
    mutationFn: ({ serviceId, optionId }: { serviceId: string; optionId: string }) =>
      deleteServiceOption(serviceId, optionId),
    onSuccess: invalidate,
  })

  const handleOptionSubmit = async () => {
    if (!selectedService.value) return

    if (editingOptionId.value) {
      await updateOptionMutation.mutateAsync({
        optionId: editingOptionId.value,
        data: {
          name: optionForm.name || undefined,
          description: optionForm.description || undefined,
          isBooleanType: optionForm.isBooleanType,
        },
      })
      return
    }

    if (!optionForm.name) return
    await createOptionMutation.mutateAsync({
      name: optionForm.name,
      description: optionForm.description || undefined,
      isBooleanType: optionForm.isBooleanType,
    })
  }

  const handleDeleteOption = (row: ServiceGuaranteeOptionVO) => {
    const serviceId = selectedService.value?.id
    if (!serviceId) return

    openConfirm('确认删除', `确认删除选项「${row.name}」？`, () => {
      return deleteOptionMutation.mutateAsync({ serviceId, optionId: row.id })
    })
  }

  const setOptionBooleanType = (checked: boolean | 'indeterminate') => {
    optionForm.isBooleanType = checked === true ? BOOLEAN_TYPE.YES : BOOLEAN_TYPE.NO
  }

  return {
    showOptionsDialog,
    showOptionDialog,
    editingOptionId,
    optionForm,
    optionDialogTitle,
    createOptionMutation,
    updateOptionMutation,
    openManageOptions,
    openCreateOption,
    openEditOption,
    handleOptionSubmit,
    handleDeleteOption,
    setOptionBooleanType,
  }
}
