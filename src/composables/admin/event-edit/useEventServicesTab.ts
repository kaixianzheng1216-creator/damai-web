import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adminBatchAddServices, adminDeleteEventService } from '@/api/event/event'
import { fetchAdminServiceList } from '@/api/event/service'
import type {
  EventServiceBatchAddRequest,
  EventServiceGuaranteeVO,
  ServiceGuaranteeVO,
} from '@/api/event'
import { queryKeys, TOAST_COPY } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { useQueryEnabled } from '@/composables/common/useQueryEnabled'

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
  const serviceDialogEnabled = useQueryEnabled(showServiceDialog)
  const selectedServices = ref<SelectedService[]>([])

  const { data: servicesData } = useQuery({
    queryKey: queryKeys.admin.list('services'),
    queryFn: fetchAdminServiceList,
    enabled: serviceDialogEnabled,
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
        await adminDeleteEventService(toValue(options.eventId), eventService.id)
      }
      return adminBatchAddServices(toValue(options.eventId), payload)
    },
    onSuccess: () => {
      toast.success(TOAST_COPY.servicesSaved)
      showServiceDialog.value = false
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error(TOAST_COPY.servicesSaveFailed)
    },
  })

  const removeServiceMutation = useMutation({
    mutationFn: (eventServiceId: string) =>
      adminDeleteEventService(toValue(options.eventId), eventServiceId),
    onSuccess: () => {
      toast.success(TOAST_COPY.serviceRemoved)
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error(TOAST_COPY.serviceRemoveFailed)
    },
  })

  const handleSaveServices = async () => {
    const hasMissingOption = selectedServices.value.some((item) => !item.optionId)
    if (hasMissingOption) {
      toast.error(TOAST_COPY.selectServiceOption)
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
