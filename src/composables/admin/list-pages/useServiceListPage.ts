import { computed, reactive, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  createService,
  createServiceOption,
  deleteService,
  deleteServiceOption,
  fetchAdminServicesPage,
  updateService,
  updateServiceOption,
} from '@/api/event/service'
import type {
  ServiceGuaranteeCreateRequest,
  ServiceGuaranteeOptionVO,
  ServiceGuaranteeUpdateRequest,
  ServiceGuaranteeVO,
  ServiceOptionCreateRequest,
  ServiceOptionUpdateRequest,
} from '@/api/event'
import { BOOLEAN_TYPE, queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

const adminServicesQueryKey = queryKeys.admin.list('services')

export function useServiceListPage() {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchName = ref('')

  const queryKey = computed(() => [
    ...adminServicesQueryKey,
    currentPage.value,
    pageSize.value,
    searchName.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminServicesPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))
  const selectedService = ref<ServiceGuaranteeVO | null>(null)
  const currentOptions = computed(() => selectedService.value?.options ?? [])

  const showServiceDialog = ref(false)
  const editingServiceId = ref<string | null>(null)
  const serviceForm = reactive<ServiceGuaranteeCreateRequest & ServiceGuaranteeUpdateRequest>({
    name: '',
    sortOrder: undefined,
  })

  const serviceDialogTitle = computed(() =>
    editingServiceId.value ? '编辑服务保障' : '新建服务保障',
  )

  const showOptionsDialog = ref(false)
  const showOptionDialog = ref(false)
  const editingOptionId = ref<string | null>(null)
  const optionForm = reactive<ServiceOptionCreateRequest & ServiceOptionUpdateRequest>({
    name: '',
    description: '',
    isBooleanType: BOOLEAN_TYPE.NO,
  })

  const optionDialogTitle = computed(() => (editingOptionId.value ? '编辑选项' : '新建选项'))

  const syncSelectedService = () => {
    const serviceId = selectedService.value?.id
    if (!serviceId) return
    const fresh = list.value.find((service) => service.id === selectedService.value?.id)
    if (fresh) selectedService.value = fresh
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminServicesQueryKey }).then(syncSelectedService)
  }

  const resetServiceForm = () => {
    serviceForm.name = ''
    serviceForm.sortOrder = undefined
  }

  const openCreateService = () => {
    resetServiceForm()
    editingServiceId.value = null
    showServiceDialog.value = true
  }

  const openEditService = (row: ServiceGuaranteeVO) => {
    serviceForm.name = row.name
    serviceForm.sortOrder = row.sortOrder
    editingServiceId.value = row.id
    showServiceDialog.value = true
  }

  const openManageOptions = (row: ServiceGuaranteeVO) => {
    const fresh = list.value.find((service) => service.id === row.id)
    selectedService.value = fresh ?? row
    showOptionsDialog.value = true
  }

  const resetOptionForm = () => {
    optionForm.name = ''
    optionForm.description = ''
    optionForm.isBooleanType = BOOLEAN_TYPE.NO
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

  const createServiceMutation = useMutation({
    mutationFn: (payload: ServiceGuaranteeCreateRequest) => createService(payload),
    onSuccess: () => {
      invalidate()
      showServiceDialog.value = false
    },
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceGuaranteeUpdateRequest }) =>
      updateService(id, data),
    onSuccess: () => {
      invalidate()
      showServiceDialog.value = false
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: invalidate,
  })

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

  watch(searchName, () => {
    currentPage.value = 1
  })

  const handleServiceSubmit = async () => {
    if (editingServiceId.value) {
      await updateServiceMutation.mutateAsync({
        id: editingServiceId.value,
        data: {
          name: serviceForm.name || undefined,
          sortOrder: serviceForm.sortOrder,
        },
      })
      return
    }

    if (!serviceForm.name) return
    await createServiceMutation.mutateAsync({
      name: serviceForm.name,
      sortOrder: serviceForm.sortOrder,
    })
  }

  const handleDeleteService = (row: ServiceGuaranteeVO) => {
    openConfirm('确认删除', `确认删除服务保障「${row.name}」？`, () => {
      return deleteServiceMutation.mutateAsync(row.id)
    })
  }

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
    currentPage,
    pageSize,
    searchName,
    isLoading,
    list,
    totalRow,
    totalPages,
    selectedService,
    currentOptions,
    showServiceDialog,
    showOptionsDialog,
    showOptionDialog,
    serviceForm,
    serviceDialogTitle,
    optionForm,
    optionDialogTitle,
    confirmDialog,
    createServiceMutation,
    updateServiceMutation,
    createOptionMutation,
    updateOptionMutation,
    openCreateService,
    openEditService,
    openManageOptions,
    openCreateOption,
    openEditOption,
    handleServiceSubmit,
    handleDeleteService,
    handleOptionSubmit,
    handleDeleteOption,
    setOptionBooleanType,
    closeConfirm,
    handleConfirm,
  }
}
