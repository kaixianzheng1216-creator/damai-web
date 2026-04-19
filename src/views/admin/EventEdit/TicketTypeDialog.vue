<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import { createTicketType, updateTicketType } from '@/api/event/event'
import { formatDateTimeLocalInput } from '@/utils/format'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import type { TicketTypeVO, TicketTypeCreateRequest, TicketTypeUpdateRequest } from '@/api/event'

interface Props {
  open: boolean
  eventId: string
  editingTicketType: TicketTypeVO | null
  sessionId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const queryClient = useQueryClient()

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const ticketTypeForm = reactive<TicketTypeCreateRequest & Partial<TicketTypeUpdateRequest>>({
  name: '',
  salePrice: 0,
  orderLimit: 1,
  accountLimit: 1,
  saleStartAt: '',
  saleEndAt: '',
  totalQty: 0,
})

const resetTicketTypeForm = () => {
  ticketTypeForm.name = ''
  ticketTypeForm.salePrice = 0
  ticketTypeForm.orderLimit = 1
  ticketTypeForm.accountLimit = 1
  ticketTypeForm.saleStartAt = ''
  ticketTypeForm.saleEndAt = ''
  ticketTypeForm.totalQty = 0
}

watch(
  () => props.editingTicketType,
  (tt) => {
    if (tt) {
      ticketTypeForm.name = tt.name
      ticketTypeForm.salePrice = tt.salePrice ?? tt.price ?? 0
      ticketTypeForm.orderLimit = tt.orderLimit || 1
      ticketTypeForm.accountLimit = tt.accountLimit || 1
      ticketTypeForm.saleStartAt = formatDateTimeLocalInput(tt.saleStartAt!)
      ticketTypeForm.saleEndAt = formatDateTimeLocalInput(tt.saleEndAt!)
    } else {
      resetTicketTypeForm()
    }
  },
  { immediate: true },
)

const createTicketTypeMutation = useMutation({
  mutationFn: (data: TicketTypeCreateRequest) =>
    props.sessionId
      ? createTicketType(props.eventId, props.sessionId, data)
      : Promise.reject(new Error('No session ID')),
  onSuccess: () => {
    toast.success('票种创建成功')
    emit('update:open', false)
    invalidateAll()
    emit('saved')
  },
  onError: () => {
    toast.error('创建失败')
  },
})

const updateTicketTypeMutation = useMutation({
  mutationFn: ({ ticketTypeId, data }: { ticketTypeId: string; data: TicketTypeUpdateRequest }) =>
    updateTicketType(props.eventId, ticketTypeId, data),
  onSuccess: () => {
    toast.success('票种更新成功')
    emit('update:open', false)
    invalidateAll()
    emit('saved')
  },
  onError: () => {
    toast.error('更新失败')
  },
})

const handleSaveTicketType = async () => {
  if (!ticketTypeForm.name || ticketTypeForm.salePrice <= 0) {
    toast.error('请填写完整信息')
    return
  }
  if (!props.editingTicketType && ticketTypeForm.totalQty <= 0) {
    toast.error('请填写总库存')
    return
  }
  if (props.editingTicketType) {
    await updateTicketTypeMutation.mutateAsync({
      ticketTypeId: props.editingTicketType.id,
      data: ticketTypeForm,
    })
  } else {
    await createTicketTypeMutation.mutateAsync(ticketTypeForm as TicketTypeCreateRequest)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ editingTicketType ? '编辑票种' : '添加票种' }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>票种名称 <span class="text-destructive">*</span></Label>
          <Input v-model="ticketTypeForm.name" placeholder="请输入票种名称" />
        </div>
        <div class="grid gap-2">
          <Label>售价（分） <span class="text-destructive">*</span></Label>
          <Input
            v-model.number="ticketTypeForm.salePrice"
            type="number"
            placeholder="请输入售价（单位：分）"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>每单限购</Label>
            <Input
              v-model.number="ticketTypeForm.orderLimit"
              type="number"
              placeholder="每单限购数量"
            />
          </div>
          <div class="grid gap-2">
            <Label>每人限购</Label>
            <Input
              v-model.number="ticketTypeForm.accountLimit"
              type="number"
              placeholder="每人限购数量"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>售卖开始时间</Label>
            <DateTimePicker v-model="ticketTypeForm.saleStartAt" placeholder="选择开始时间" />
          </div>
          <div class="grid gap-2">
            <Label>售卖结束时间</Label>
            <DateTimePicker v-model="ticketTypeForm.saleEndAt" placeholder="选择结束时间" />
          </div>
        </div>
        <div v-if="!editingTicketType" class="grid gap-2">
          <Label>总库存 <span class="text-destructive">*</span></Label>
          <Input
            v-model.number="ticketTypeForm.totalQty"
            type="number"
            placeholder="请输入总库存"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button @click="handleSaveTicketType">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
