<script setup lang="ts">
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
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import type { TicketTypeVO } from '@/api/event'
import { useTicketTypeDialog } from '@/composables/admin'

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

const {
  form,
  isEditing,
  dialogTitle,
  createTicketTypeMutation,
  updateTicketTypeMutation,
  handleSaveTicketType,
} = useTicketTypeDialog({
  eventId: () => props.eventId,
  sessionId: () => props.sessionId,
  editingTicketType: () => props.editingTicketType,
  onOpenChange: (open) => emit('update:open', open),
  onSaved: () => emit('saved'),
})
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="ticket-type-name">票种名称 <span class="text-destructive">*</span></Label>
          <Input id="ticket-type-name" v-model="form.name" placeholder="请输入票种名称" />
        </div>
        <div class="grid gap-2">
          <Label for="ticket-type-sale-price"
            >售价（分） <span class="text-destructive">*</span></Label
          >
          <Input
            id="ticket-type-sale-price"
            v-model.number="form.salePrice"
            type="number"
            placeholder="请输入售价（单位：分）"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="ticket-type-order-limit">每单限购</Label>
            <Input
              id="ticket-type-order-limit"
              v-model.number="form.orderLimit"
              type="number"
              placeholder="每单限购数量"
            />
          </div>
          <div class="grid gap-2">
            <Label for="ticket-type-account-limit">每人限购</Label>
            <Input
              id="ticket-type-account-limit"
              v-model.number="form.accountLimit"
              type="number"
              placeholder="每人限购数量"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>售卖开始时间</Label>
            <DateTimePicker v-model="form.saleStartAt" placeholder="选择开始时间" />
          </div>
          <div class="grid gap-2">
            <Label>售卖结束时间</Label>
            <DateTimePicker v-model="form.saleEndAt" placeholder="选择结束时间" />
          </div>
        </div>
        <div v-if="!isEditing" class="grid gap-2">
          <Label for="ticket-type-total-qty">总库存 <span class="text-destructive">*</span></Label>
          <Input
            id="ticket-type-total-qty"
            v-model.number="form.totalQty"
            type="number"
            placeholder="请输入总库存"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button
          type="button"
          :disabled="
            createTicketTypeMutation.isPending.value || updateTicketTypeMutation.isPending.value
          "
          @click="handleSaveTicketType"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
