<script setup lang="ts">
import { PAYMENT_CHANNELS, PAYMENT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'

defineProps<{
  open: boolean
  selectedChannel: number
  qrCodeBase64: string
  tradeNo: string
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ PAYMENT_COPY.scanQrPay }}</DialogTitle>
        <DialogDescription>
          请使用
          {{
            selectedChannel === PAYMENT_CHANNELS.ALIPAY ? PAYMENT_COPY.alipay : PAYMENT_COPY.wechat
          }}
          扫码完成支付
        </DialogDescription>
      </DialogHeader>
      <div class="py-2">
        <div v-if="qrCodeBase64" class="text-center">
          <img
            :src="qrCodeBase64"
            :alt="PAYMENT_COPY.qrCodeAlt"
            class="mx-auto h-52 w-52 rounded-md border border-border"
          />
          <p class="mt-2 text-xs text-muted-foreground">{{ PAYMENT_COPY.tradeNo }}{{ tradeNo }}</p>
        </div>
        <div v-else class="py-8 text-center">
          <icon-lucide-loader2 class="mx-auto h-8 w-8 animate-spin text-primary" />
          <p class="mt-2 text-sm text-muted-foreground">{{ PAYMENT_COPY.generatingQrCode }}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          {{ PAYMENT_COPY.close }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
