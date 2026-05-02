<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { FieldError } from '@/components/common/ui/field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/ui/dialog'
import type { TicketTypeVO } from '@/api/event'
import { useInventoryAdjustDialog } from '@/composables/admin'

const props = defineProps<{
  open: boolean
  eventId: string
  ticketType: TicketTypeVO | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { adjustQty, adjustError, adjustInventoryMutation, handleAdjustInventory } =
  useInventoryAdjustDialog({
    eventId: () => props.eventId,
    open: () => props.open,
    ticketType: () => props.ticketType,
    onOpenChange: (open) => emit('update:open', open),
    onSaved: () => emit('saved'),
  })

const isSaving = computed(() => adjustInventoryMutation.isPending.value)

const handleOpenChange = (value: boolean) => {
  if (!value && !isSaving.value) {
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-md overflow-hidden sm:max-w-md"
      :show-close-button="!isSaving"
    >
      <DialogHeader>
        <DialogTitle>调整库存</DialogTitle>
        <DialogDescription>正数增加库存，负数扣减可售库存。</DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="inventory-adjust-qty">调整数量（正数增加，负数减少）</Label>
          <Input
            id="inventory-adjust-qty"
            v-model.number="adjustQty"
            type="number"
            placeholder="请输入调整数量"
            :aria-invalid="Boolean(adjustError) || undefined"
            :disabled="isSaving"
          />
          <FieldError v-if="adjustError">{{ adjustError }}</FieldError>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="handleOpenChange(false)"
        >
          取消
        </Button>
        <Button type="button" :disabled="isSaving" @click="handleAdjustInventory"> 调整 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
