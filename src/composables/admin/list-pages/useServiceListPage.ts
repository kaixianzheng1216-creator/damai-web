import { computed, reactive, ref, watch, type Ref, type ComputedRef } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { queryKeys } from '@/constants'
import { BOOLEAN_TYPE } from '@/constants'
import {
  createService,
  deleteService,
  fetchAdminServicesPage,
  updateService,
  createServiceOption,
  deleteServiceOption,
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
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

type ServiceForm = {
  name: string
  sortOrder?: number
}

type OptionForm = {
  name: string
  description?: string
  isBooleanType?: number
}

export function useServiceListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<ServiceGuaranteeVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  selectedService: Ref<ServiceGuaranteeVO | null>
  currentOptions: ComputedRef<ServiceGuaranteeVO['options']>
  showServiceDialog: Ref<boolean>
  showOptionsDialog: Ref<boolean>
  showOptionDialog: Ref<boolean>
  serviceForm: { name: string; sortOrder?: number }
  serviceDialogTitle: ComputedRef<string>
  optionForm: { name: string; description?: string; isBooleanType?: number }
  optionDialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createServiceMutation: {
    mutateAsync: (data: ServiceGuaranteeCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateServiceMutation: {
    mutateAsync: (vars: { id: string; data: ServiceGuaranteeUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  createOptionMutation: {
    mutateAsync: (data: ServiceOptionCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateOptionMutation: {
    mutateAsync: (vars: { optionId: string; data: ServiceOptionUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  openCreateService: () => void
  openEditService: (row: ServiceGuaranteeVO) => void
  openManageOptions: (row: ServiceGuaranteeVO) => void
  openCreateOption: () => void
  openEditOption: (row: ServiceGuaranteeOptionVO) => void
  handleServiceSubmit: () => Promise<void>
  handleDeleteService: (row: ServiceGuaranteeVO) => void
  handleOptionSubmit: () => Promise<void>
  handleDeleteOption: (row: ServiceGuaranteeOptionVO) => void
  setOptionBooleanType: (checked: boolean | 'indeterminate') => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  // ── Service CRUD (useAdminCrud) ──

  const crud = useAdminCrud<
    ServiceGuaranteeVO,
    ServiceForm,
    ServiceGuaranteeCreateRequest,
    ServiceGuaranteeUpdateRequest
  >({
    queryKeyBase: queryKeys.admin.list('services'),
    fetchPage: fetchAdminServicesPage,
    createItem: createService,
    updateItem: updateService,
    deleteItem: deleteService,
    initialForm: {
      name: '',
      sortOrder: undefined,
    },
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除服务保障「${item.name}」？`,
    }),
  })

  // ── Custom overrides for service dialog ──

  const serviceDialogTitle = computed(() =>
    crud.editingId.value ? '编辑服务保障' : '新建服务保障',
  )

  const openEditService = (row: ServiceGuaranteeVO) => {
    crud.openEdit(row, (item) => ({
      name: item.name,
      sortOrder: item.sortOrder,
    }))
  }

  const handleServiceSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        if (crud.editingId.value) return true
        if (!crud.form.name) {
          toast.error('请填写服务保障名称')
          return false
        }
        return true
      },
      getCreateData: () => ({
        name: crud.form.name,
        sortOrder: crud.form.sortOrder,
      }),
      getUpdateData: () => ({
        name: crud.form.name || undefined,
        sortOrder: crud.form.sortOrder,
      }),
    })

  // ── Selected service tracking ──

  const selectedService = ref<ServiceGuaranteeVO | null>(null)
  const currentOptions = computed(() => selectedService.value?.options ?? [])

  const syncSelectedService = () => {
    const serviceId = selectedService.value?.id
    if (!serviceId) return
    const fresh = crud.list.value.find((service) => service.id === serviceId)
    if (fresh) selectedService.value = fresh
  }

  watch(crud.list, () => {
    syncSelectedService()
  })

  // ── Options management ──

  const showOptionsDialog = ref(false)
  const showOptionDialog = ref(false)
  const editingOptionId = ref<string | null>(null)
  const optionForm = reactive<OptionForm>({
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
    const fresh = crud.list.value.find((service) => service.id === row.id)
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
      crud.invalidate()
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
      crud.invalidate()
      showOptionDialog.value = false
    },
  })

  const deleteOptionMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => {
      const serviceId = selectedService.value?.id
      if (!serviceId) {
        throw new Error('Missing selected service')
      }
      return deleteServiceOption(serviceId, optionId)
    },
    onSuccess: () => {
      crud.invalidate()
    },
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

    crud.openConfirm('确认删除', `确认删除选项「${row.name}」？`, () => {
      return deleteOptionMutation.mutateAsync({ optionId: row.id })
    })
  }

  const setOptionBooleanType = (checked: boolean | 'indeterminate') => {
    optionForm.isBooleanType = checked === true ? BOOLEAN_TYPE.YES : BOOLEAN_TYPE.NO
  }

  // ── Return ──

  return {
    // list
    currentPage: crud.currentPage,
    pageSize: crud.pageSize,
    searchName: crud.searchName,
    isLoading: crud.isLoading,
    list: crud.list,
    totalRow: crud.totalRow,
    totalPages: crud.totalPages,
    // service dialog
    showServiceDialog: crud.showDialog,
    serviceForm: crud.form,
    serviceDialogTitle,
    // options
    selectedService,
    currentOptions,
    showOptionsDialog,
    showOptionDialog,
    optionForm,
    optionDialogTitle,
    // confirm
    confirmDialog: crud.confirmDialog,
    // mutations
    createServiceMutation: crud.createMutation,
    updateServiceMutation: crud.updateMutation,
    createOptionMutation,
    updateOptionMutation,
    // actions
    openCreateService: crud.openCreate,
    openEditService,
    openManageOptions,
    openCreateOption,
    openEditOption,
    handleServiceSubmit,
    handleDeleteService: crud.handleDelete,
    handleOptionSubmit,
    handleDeleteOption,
    setOptionBooleanType,
    closeConfirm: crud.closeConfirm,
    handleConfirm: crud.handleConfirm,
  }
}
