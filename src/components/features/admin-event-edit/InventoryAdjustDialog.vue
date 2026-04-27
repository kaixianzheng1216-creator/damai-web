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
import type { TicketTypeVO } from '@/api/event'
import { useInventoryAdjustDialog } from '@/composables/admin'

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

const { adjustQty, adjustInventoryMutation, handleAdjustInventory } = useInventoryAdjustDialog({
  eventId: () => props.eventId,
  open: () => props.open,
  ticketType: () => props.ticketType,
  onOpenChange: (open) => emit('update:open', open),
  onSaved: () => emit('saved'),
})
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>调整库存</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="inventory-adjust-qty">调整数量（正数增加，负数减少）</Label>
          <Input
            id="inventory-adjust-qty"
            v-model.number="adjustQty"
            type="number"
            placeholder="请输入调整数量"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button
          type="button"
          :disabled="adjustInventoryMutation.isPending.value"
          @click="handleAdjustInventory"
        >
          调整
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
