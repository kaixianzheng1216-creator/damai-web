import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { batchAddServices, removeService } from '@/api/event/event'
import { fetchAdminServices } from '@/api/event/service'
import type {
  EventServiceBatchAddRequest,
  EventServiceGuaranteeVO,
  ServiceGuaranteeVO,
} from '@/api/event'
import { queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'

interface UseEventServicesTabOptions {
  eventId: MaybeRefOrGetter<string>
  eventServices: MaybeRefOrGetter<EventServiceGuaranteeVO[]>
  onUpdated: () => void
}

interface SelectedService {
  serviceId: string
  optionId: string
}

export function useEventServicesTab(options: UseEventServicesTabOptions) {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const showServiceDialog = ref(false)
  const selectedServices = ref<SelectedService[]>([])

  const { data: servicesData } = useQuery({
    queryKey: queryKeys.admin.list('services'),
    queryFn: fetchAdminServices,
    enabled: showServiceDialog,
  })

  const openServiceDialog = () => {
    selectedServices.value = toValue(options.eventServices).map((item) => ({
      serviceId: item.serviceGuarantee.id,
      optionId: item.serviceGuaranteeOption.id,
    }))
    showServiceDialog.value = true
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  const batchAddServicesMutation = useMutation({
    mutationFn: async (payload: EventServiceBatchAddRequest) => {
      for (const eventService of toValue(options.eventServices)) {
        await removeService(toValue(options.eventId), eventService.id)
      }
      return batchAddServices(toValue(options.eventId), payload)
    },
    onSuccess: () => {
      toast.success('服务保障保存成功')
      showServiceDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('保存失败')
    },
  })

  const removeServiceMutation = useMutation({
    mutationFn: (eventServiceId: string) => removeService(toValue(options.eventId), eventServiceId),
    onSuccess: () => {
      toast.success('服务保障移除成功')
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('移除失败')
    },
  })

  const handleSaveServices = async () => {
    const hasMissingOption = selectedServices.value.some((item) => !item.optionId)
    if (hasMissingOption) {
      toast.error('请为每个选中的服务保障选择一个选项')
      return
    }

    const services = selectedServices.value.map((item) => ({
      serviceGuaranteeId: item.serviceId,
      serviceGuaranteeOptionId: item.optionId,
    }))
    await batchAddServicesMutation.mutateAsync({ services })
  }

  const toggleService = (service: ServiceGuaranteeVO) => {
    const index = selectedServices.value.findIndex((item) => item.serviceId === service.id)
    if (index > -1) {
      selectedServices.value.splice(index, 1)
      return
    }

    const firstOption = service.options?.[0]
    if (firstOption) {
      selectedServices.value.push({
        serviceId: service.id,
        optionId: firstOption.id,
      })
    }
  }

  const isServiceSelected = (serviceId: string) =>
    selectedServices.value.some((item) => item.serviceId === serviceId)

  const getSelectedOption = (serviceId: string) =>
    selectedServices.value.find((item) => item.serviceId === serviceId)?.optionId

  const setSelectedOption = (serviceId: string, optionId: string) => {
    const service = selectedServices.value.find((item) => item.serviceId === serviceId)
    if (service) {
      service.optionId = optionId
    }
  }

  const handleRemoveService = (eventService: EventServiceGuaranteeVO) => {
    openConfirm('确认移除', `确认移除服务保障「${eventService.serviceGuarantee.name}」？`, () =>
      removeServiceMutation.mutateAsync(eventService.id),
    )
  }

  return {
    confirmDialog,
    showServiceDialog,
    servicesData,
    selectedServices,
    batchAddServicesMutation,
    openServiceDialog,
    handleSaveServices,
    toggleService,
    isServiceSelected,
    getSelectedOption,
    setSelectedOption,
    handleRemoveService,
    closeConfirm,
    handleConfirm,
  }
}
