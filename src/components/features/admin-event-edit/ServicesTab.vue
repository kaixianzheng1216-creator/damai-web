<script setup lang="ts">
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import { Checkbox } from '@/components/common/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import type { EventServiceGuaranteeVO } from '@/api/event'
import { useEventServicesTab } from '@/composables/admin'

interface Props {
  eventId: string
  eventServices: EventServiceGuaranteeVO[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const {
  confirmDialog,
  showServiceDialog,
  servicesData,
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
} = useEventServicesTab({
  eventId: () => props.eventId,
  eventServices: () => props.eventServices,
  onUpdated: () => emit('updated'),
})
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>服务保障</CardTitle>
        <Button type="button" @click="openServiceDialog">编辑服务保障</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="eventServices.length === 0" class="text-center py-4 text-muted-foreground">
        暂无服务保障
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="service in eventServices"
          :key="service.id"
          class="flex items-center justify-between p-3 border rounded-lg"
        >
          <div>
            <div class="font-medium">{{ service.serviceGuarantee.name }}</div>
            <div v-if="service.serviceGuaranteeOption" class="text-sm text-muted-foreground">
              {{ service.serviceGuaranteeOption.name }}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-destructive"
            @click="handleRemoveService(service)"
            >移除</Button
          >
        </div>
      </div>
    </CardContent>
  </Card>

  <Dialog :open="showServiceDialog" @update:open="(v) => !v && (showServiceDialog = false)">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-2xl sm:max-w-2xl">
      <DialogHeader class="pb-4">
        <DialogTitle class="text-lg font-semibold">选择服务保障</DialogTitle>
      </DialogHeader>
      <div class="max-h-[60vh] overflow-y-auto pr-1">
        <div
          v-if="!servicesData || servicesData.length === 0"
          class="text-center py-12 text-muted-foreground"
        >
          暂无可用服务保障
        </div>
        <div v-else class="space-y-4">
          <div v-for="service in servicesData" :key="service.id" class="p-4 border rounded-lg">
            <div class="flex items-start gap-3">
              <Checkbox
                :id="`service-option-${service.id}`"
                :checked="isServiceSelected(service.id)"
                :aria-label="`选择服务保障 ${service.name}`"
                @update:checked="() => toggleService(service)"
              />
              <div class="flex-1">
                <Label :for="`service-option-${service.id}`" class="font-medium">
                  {{ service.name }}
                </Label>
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
                      <RadioGroupItem
                        :value="option.id"
                        :id="`option-${service.id}-${option.id}`"
                      />
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
        <Button type="button" variant="outline" @click="showServiceDialog = false">取消</Button>
        <Button
          type="button"
          :disabled="batchAddServicesMutation.isPending.value"
          @click="handleSaveServices"
        >
          {{ batchAddServicesMutation.isPending.value ? '保存中...' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    :confirm-text="confirmDialog.confirmText"
    :confirm-variant="confirmDialog.confirmVariant"
    :loading="confirmDialog.isProcessing"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
