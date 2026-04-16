<script setup lang="ts">
import { ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import { Checkbox } from '@/components/common/ui/checkbox'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/common/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { fetchAdminServices } from '@/api/event/service'
import { batchAddServices, removeService } from '@/api/event/event'
import type { EventServiceGuaranteeVO, EventServiceBatchAddRequest, ServiceGuaranteeVO } from '@/api/event'

interface Props {
  eventId: string
  eventServices: EventServiceGuaranteeVO[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

const { data: servicesData } = useQuery({
  queryKey: ['admin-services'],
  queryFn: fetchAdminServices,
})

const showServiceDialog = ref(false)

interface SelectedService {
  serviceId: string
  optionId: string
}

const selectedServices = ref<SelectedService[]>([])

const openServiceDialog = () => {
  selectedServices.value = props.eventServices.map(s => ({
    serviceId: s.serviceGuarantee.id,
    optionId: s.serviceGuaranteeOption.id,
  }))
  showServiceDialog.value = true
}

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const batchAddServicesMutation = useMutation({
  mutationFn: async (data: EventServiceBatchAddRequest) => {
    for (const eventService of props.eventServices) {
      await removeService(props.eventId, eventService.id)
    }
    return batchAddServices(props.eventId, data)
  },
  onSuccess: () => {
    toast.success('服务保障保存成功')
    showServiceDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('保存失败')
  },
})

const removeServiceMutation = useMutation({
  mutationFn: (eventServiceId: string) => removeService(props.eventId, eventServiceId),
  onSuccess: () => {
    toast.success('服务保障移除成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('移除失败')
  },
})

const handleSaveServices = async () => {
  const hasMissingOption = selectedServices.value.some(s => !s.optionId)
  if (hasMissingOption) {
    toast.error('请为每个选中的服务保障选择一个选项')
    return
  }

  const services = selectedServices.value.map(item => ({
    serviceGuaranteeId: parseInt(item.serviceId),
    serviceGuaranteeOptionId: parseInt(item.optionId),
  }))
  await batchAddServicesMutation.mutateAsync({ services })
}

const toggleService = (service: ServiceGuaranteeVO) => {
  const index = selectedServices.value.findIndex(s => s.serviceId === service.id)
  if (index > -1) {
    selectedServices.value.splice(index, 1)
  } else {
    const firstOption = service.options?.[0]
    if (firstOption) {
      selectedServices.value.push({
        serviceId: service.id,
        optionId: firstOption.id,
      })
    }
  }
}

const isServiceSelected = (serviceId: string) => {
  return selectedServices.value.some(s => s.serviceId === serviceId)
}

const getSelectedOption = (serviceId: string) => {
  return selectedServices.value.find(s => s.serviceId === serviceId)?.optionId
}

const setSelectedOption = (serviceId: string, optionId: string) => {
  const service = selectedServices.value.find(s => s.serviceId === serviceId)
  if (service) {
    service.optionId = optionId
  }
}

const handleRemoveService = (eventService: EventServiceGuaranteeVO) => {
  openConfirm('确认移除', `确认移除服务保障「${eventService.serviceGuarantee.name}」？`, () => removeServiceMutation.mutate(eventService.id))
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>服务保障</CardTitle>
        <Button @click="openServiceDialog">编辑服务保障</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="eventServices.length === 0" class="text-center py-4 text-muted-foreground">
        暂无服务保障
      </div>
      <div v-else class="space-y-3">
        <div v-for="service in eventServices" :key="service.id" class="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div class="font-medium">{{ service.serviceGuarantee.name }}</div>
            <div v-if="service.serviceGuaranteeOption" class="text-sm text-muted-foreground">
              {{ service.serviceGuaranteeOption.name }}
            </div>
          </div>
          <Button size="sm" @click="handleRemoveService(service)">移除</Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <Dialog :open="showServiceDialog" @update:open="(v) => !v && (showServiceDialog = false)">
    <DialogContent class="max-w-2xl">
      <DialogHeader class="pb-4">
        <DialogTitle class="text-lg font-semibold">选择服务保障</DialogTitle>
      </DialogHeader>
      <div class="max-h-[60vh] overflow-y-auto pr-1">
        <div v-if="!servicesData || servicesData.length === 0" class="text-center py-12 text-muted-foreground">
          暂无可用服务保障
        </div>
        <div v-else class="space-y-4">
          <div v-for="service in servicesData" :key="service.id" class="p-4 border rounded-lg">
            <div class="flex items-start gap-3">
              <Checkbox
                :checked="isServiceSelected(service.id)"
                @update:checked="() => toggleService(service)"
              />
              <div class="flex-1">
                <div class="font-medium">{{ service.name }}</div>
                <div v-if="service.options && service.options.length > 0" class="mt-3">
                  <RadioGroup
                    :value="getSelectedOption(service.id) || ''"
                    @update:value="(v: string) => setSelectedOption(service.id, v)"
                    :disabled="!isServiceSelected(service.id)"
                    class="space-y-2"
                  >
                    <div
                      v-for="option in service.options"
                      :key="option.id"
                      class="flex items-center gap-2 p-3 border rounded-lg"
                      :class="!isServiceSelected(service.id) ? 'opacity-50' : ''"
                    >
                      <RadioGroupItem :value="option.id" :id="`option-${service.id}-${option.id}`" />
                      <Label :for="`option-${service.id}-${option.id}`">{{ option.name }}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter class="pt-4">
        <Button variant="outline" @click="showServiceDialog = false">取消</Button>
        <Button :disabled="batchAddServicesMutation.isPending.value" @click="handleSaveServices">
          {{ batchAddServicesMutation.isPending.value ? '保存中...' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog :open="confirmDialog.open" :title="confirmDialog.title"
    :description="confirmDialog.description" @close="closeConfirm" @confirm="handleConfirm" />
</template>
