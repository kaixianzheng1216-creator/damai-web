<script setup lang="ts">
import { ref } from 'vue'
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
import { adjustTicketTypeInventory } from '@/api/event/event'
import type { TicketTypeVO, TicketTypeInventoryAdjustRequest } from '@/api/event'

interface Props {
  open: boolean
  eventId: string
  ticketType: TicketTypeVO | null
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

const adjustQty = ref(0)

const adjustInventoryMutation = useMutation({
  mutationFn: ({
    ticketTypeId,
    data,
  }: {
    ticketTypeId: string
    data: TicketTypeInventoryAdjustRequest
  }) => adjustTicketTypeInventory(props.eventId, ticketTypeId, data),
  onSuccess: () => {
    toast.success('库存调整成功')
    emit('update:open', false)
    invalidateAll()
    emit('saved')
  },
  onError: () => {
    toast.error('调整失败')
  },
})

const handleAdjustInventory = async () => {
  if (!props.ticketType || adjustQty.value === 0) {
    toast.error('请输入调整数量')
    return
  }
  await adjustInventoryMutation.mutateAsync({
    ticketTypeId: props.ticketType.id,
    data: { adjustQty: adjustQty.value },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>调整库存</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>调整数量（正数增加，负数减少）</Label>
          <Input v-model.number="adjustQty" type="number" placeholder="请输入调整数量" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button @click="handleAdjustInventory">调整</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
