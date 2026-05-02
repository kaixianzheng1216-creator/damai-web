import { computed, reactive, ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createService, deleteService, updateService } from '@/api/event/service'
import type {
  ServiceGuaranteeCreateRequest,
  ServiceGuaranteeUpdateRequest,
  ServiceGuaranteeVO,
} from '@/api/event'

export function useServiceDialog(
  invalidate: () => Promise<void>,
  openConfirm: (title: string, description: string, onConfirm: () => void | Promise<void>) => void,
) {
  const showServiceDialog = ref(false)
  const editingServiceId = ref<string | null>(null)
  const serviceForm = reactive<ServiceGuaranteeCreateRequest & ServiceGuaranteeUpdateRequest>({
    name: '',
    sortOrder: undefined,
  })

  const serviceDialogTitle = computed(() =>
    editingServiceId.value ? '编辑服务保障' : '新建服务保障',
  )

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

    if (!serviceForm.name) {
      toast.error('请填写服务保障名称')
      return
    }
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

  return {
    showServiceDialog,
    editingServiceId,
    serviceForm,
    serviceDialogTitle,
    createServiceMutation,
    updateServiceMutation,
    openCreateService,
    openEditService,
    handleServiceSubmit,
    handleDeleteService,
  }
}
