<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import type { PassengerItem } from '@/api/account'

interface PassengerSlot {
  index: number
  label: string
  passengerId: string | null
}

const props = defineProps<{
  open: boolean
  passengers: PassengerItem[]
  passengerKeyword: string
  passengerSlots: PassengerSlot[]
  duplicatePassengerSelected: boolean
  insufficientPassengerCount: boolean
  isSubmitting: boolean
  canSubmitOrder: boolean
  passengerOptionDisabled: (passengerId: string, currentIndex: number) => boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
  'update-slot': [payload: { index: number; passengerId: string | null }]
  'update:passengerKeyword': [value: string]
}>()

const handleUpdateSlot = (index: number, value: unknown) => {
  const id = value ? String(value) : null
  emit('update-slot', { index, passengerId: id })
}

const handleOpenChange = (value: boolean) => {
  if (!value && !props.isSubmitting) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-lg sm:max-w-lg"
      :show-close-button="!isSubmitting"
    >
      <DialogHeader>
        <DialogTitle>选择购票人</DialogTitle>
        <DialogDescription>请确认本次订单对应的实名购票人。</DialogDescription>
      </DialogHeader>

      <div class="space-y-3">
        <Input
          :model-value="passengerKeyword"
          class="h-9"
          placeholder="搜索购票人姓名"
          aria-label="搜索购票人姓名"
          @update:model-value="emit('update:passengerKeyword', String($event))"
        />

        <div v-if="!passengers.length" class="section-card-muted text-muted-sm">
          暂无可用购票人，请先到个人中心添加常用购票人。
        </div>

        <div
          v-if="insufficientPassengerCount && passengers.length > 0"
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
        >
          当前仅有 {{ passengers.length }} 位购票人，无法完成
          {{ passengerSlots.length }} 张票的实名绑定，请先到个人中心补充购票人。
        </div>

        <div v-for="slot in passengerSlots" :key="slot.index" class="section-card">
          <p
            :id="`checkout-passenger-slot-${slot.index}`"
            class="text-sm font-medium text-foreground"
          >
            {{ slot.label }}
          </p>
          <div class="mt-3">
            <Select
              :model-value="slot.passengerId ?? ''"
              @update:model-value="handleUpdateSlot(slot.index, $event)"
            >
              <SelectTrigger
                class="h-10 w-full"
                :aria-labelledby="`checkout-passenger-slot-${slot.index}`"
              >
                <SelectValue placeholder="请选择购票人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="passenger in passengers"
                  :key="passenger.id"
                  :value="passenger.id"
                  :disabled="passengerOptionDisabled(passenger.id, slot.index)"
                >
                  {{ passenger.name }} · {{ passenger.certType }} · {{ passenger.certNo }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          v-if="duplicatePassengerSelected"
          class="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          同一订单中的每张票都需要绑定不同的购票人，请重新选择。
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" :disabled="isSubmitting" @click="emit('close')">
          取消
        </Button>
        <Button
          type="button"
          :disabled="
            isSubmitting ||
            !canSubmitOrder ||
            duplicatePassengerSelected ||
            insufficientPassengerCount
          "
          @click="emit('confirm')"
        >
          <icon-lucide-loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          确认购票
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
