<script setup lang="ts">
import { computed } from 'vue'
import {
  PAYMENT_CHANNELS,
  PAYMENT_CHANNEL_OPTIONS,
  PAYMENT_COPY,
  PAYMENT_METHOD_OPTIONS,
} from '@/constants'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio-group'
import IconAlipay from '@/components/common/icons/IconAlipay.vue'
import IconWechatPay from '@/components/common/icons/IconWechatPay.vue'

const props = defineProps<{
  selectedChannel: number
  selectedMethod: number
  isPending: boolean
  isPaid: boolean
  isCancelled: boolean
  isClosed: boolean
  isCreatingPayment: boolean
  isCancellingOrder: boolean
  canRefund?: boolean
}>()

const emit = defineEmits<{
  'update:selectedChannel': [value: number]
  'update:selectedMethod': [value: number]
  createPayment: []
  cancelOrder: []
  goOrders: []
  refund: []
}>()

const selectedMethodModel = computed({
  get: () => String(props.selectedMethod),
  set: (value: string) => {
    emit('update:selectedMethod', Number(value))
  },
})

const selectChannel = (value: number, disabled?: boolean) => {
  if (!props.isPending || disabled) {
    return
  }

  emit('update:selectedChannel', value)
}
</script>

<template>
  <aside class="rounded-2xl border border-border bg-background p-5 shadow-sm">
    <h3 class="text-base font-semibold text-foreground">
      {{ PAYMENT_COPY.selectPaymentChannel }}
    </h3>
    <div class="mt-4 grid grid-cols-2 gap-3">
      <button
        v-for="channel in PAYMENT_CHANNEL_OPTIONS"
        :key="channel.value"
        type="button"
        class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all"
        :class="[
          selectedChannel === channel.value
            ? 'border-foreground/30 bg-muted/40 shadow-sm'
            : 'border-border hover:border-foreground/20',
          !isPending || channel.disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        :disabled="!isPending || channel.disabled"
        @click="selectChannel(channel.value, channel.disabled)"
      >
        <IconAlipay v-if="channel.value === PAYMENT_CHANNELS.ALIPAY" class="h-8 w-8" />
        <IconWechatPay v-else-if="channel.value === PAYMENT_CHANNELS.WECHAT" class="h-8 w-8" />
        <icon-lucide-credit-card v-else class="h-8 w-8" />
        <span class="text-sm font-medium text-foreground">{{ channel.label }}</span>
        <span v-if="channel.disabled" class="text-xs text-muted-foreground">
          {{ PAYMENT_COPY.notAvailable }}
        </span>
      </button>
    </div>

    <h3 class="mt-6 text-base font-semibold text-foreground">
      {{ PAYMENT_COPY.selectPaymentMethod }}
    </h3>
    <RadioGroup v-model="selectedMethodModel" class="mt-3 space-y-2" :disabled="!isPending">
      <div
        v-for="method in PAYMENT_METHOD_OPTIONS"
        :key="method.value"
        class="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors"
        :class="[
          !isPending || method.disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-muted/30 cursor-pointer',
        ]"
      >
        <RadioGroupItem
          :id="`method-${method.value}`"
          :value="String(method.value)"
          :disabled="!isPending || method.disabled"
        />
        <Label
          :for="`method-${method.value}`"
          class="text-sm font-normal"
          :class="{
            'cursor-pointer': isPending && !method.disabled,
            'cursor-not-allowed': !isPending || method.disabled,
          }"
        >
          {{ method.label }}
        </Label>
        <span v-if="method.disabled" class="ml-auto text-xs text-muted-foreground">
          {{ PAYMENT_COPY.notAvailable }}
        </span>
      </div>
    </RadioGroup>

    <div class="mt-6 space-y-3">
      <Button
        class="w-full"
        :disabled="!isPending || isCreatingPayment"
        @click="$emit('createPayment')"
      >
        <icon-lucide-loader2 v-if="isCreatingPayment" class="mr-2 h-4 w-4 animate-spin" />
        <icon-lucide-qr-code v-else class="mr-2 h-4 w-4" />
        {{ PAYMENT_COPY.qrPay }}
      </Button>
      <Button
        v-if="isPending"
        variant="outline"
        class="w-full"
        :disabled="isCancellingOrder"
        @click="$emit('cancelOrder')"
      >
        <icon-lucide-loader2 v-if="isCancellingOrder" class="mr-2 h-4 w-4 animate-spin" />
        {{ PAYMENT_COPY.cancelOrder }}
      </Button>
      <Button
        v-else-if="isPaid && canRefund"
        variant="outline"
        class="w-full"
        @click="$emit('refund')"
      >
        <icon-lucide-undo-2 class="mr-2 h-4 w-4" />
        申请退款
      </Button>
      <Button v-else variant="outline" class="w-full" disabled>
        <icon-lucide-check-circle class="mr-2 h-4 w-4" />
        {{
          isPaid
            ? PAYMENT_COPY.paid
            : isCancelled
              ? PAYMENT_COPY.cancelled
              : isClosed
                ? PAYMENT_COPY.closed
                : PAYMENT_COPY.refunded
        }}
      </Button>
      <Button variant="outline" class="w-full" @click="$emit('goOrders')">
        {{ PAYMENT_COPY.backToOrders }}
      </Button>
    </div>
  </aside>
</template>
