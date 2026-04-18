<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { checkinTicket } from '@/api/ticket/ticket'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const videoRef = ref<HTMLVideoElement>()
const manualToken = ref('')
const isSubmitting = ref(false)
const lastScannedToken = ref('')
const result = ref<{ type: 'success' | 'error'; message: string } | null>(null)

let controls: IScannerControls | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const stopScanner = () => {
  controls?.stop()
  controls = null
}

const showResult = (type: 'success' | 'error', message: string) => {
  result.value = { type, message }
  setTimeout(() => {
    result.value = null
  }, 3000)
}

const submit = async (token: string) => {
  const t = token.trim()
  if (!t || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await checkinTicket(t)
    showResult('success', `检票成功：${t}`)
    manualToken.value = ''
    lastScannedToken.value = ''
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? '检票失败，请重试'
    showResult('error', msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleScanResult = (token: string) => {
  if (token === lastScannedToken.value) return
  lastScannedToken.value = token
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    submit(token)
    debounceTimer = setTimeout(() => {
      lastScannedToken.value = ''
    }, 2000)
  }, 300)
}

const startScanner = async () => {
  if (!videoRef.value) return
  stopScanner()
  result.value = null

  try {
    const reader = new BrowserQRCodeReader()
    controls = await reader.decodeFromVideoDevice(undefined, videoRef.value, (res, _err) => {
      if (res) handleScanResult(res.getText())
    })
  } catch {
    showResult('error', '摄像头启动失败，请检查权限或使用手动输入')
  }
}

const handleOpen = (val: boolean) => {
  if (!val) stopScanner()
  emit('update:open', val)
}

onUnmounted(stopScanner)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpen">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>扫码检票</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- 摄像头区域 -->
        <div class="relative overflow-hidden rounded-lg bg-black aspect-square">
          <video ref="videoRef" class="h-full w-full object-cover" autoplay muted playsinline />
          <!-- 扫描框 -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-2/3 aspect-square border-2 border-white/70 rounded-lg relative">
              <span
                class="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg"
              />
              <span
                class="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg"
              />
              <span
                class="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg"
              />
              <span
                class="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg"
              />
            </div>
          </div>
        </div>

        <Button class="w-full" variant="outline" @click="startScanner">
          <icon-lucide-camera class="mr-2 h-4 w-4" />
          启动摄像头
        </Button>

        <!-- 结果提示 -->
        <div
          v-if="result"
          :class="[
            'rounded-lg px-4 py-3 text-sm font-medium',
            result.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-destructive/10 text-destructive border border-destructive/20',
          ]"
        >
          <icon-lucide-check-circle v-if="result.type === 'success'" class="inline mr-1 h-4 w-4" />
          <icon-lucide-x-circle v-else class="inline mr-1 h-4 w-4" />
          {{ result.message }}
        </div>

        <!-- 手动输入 -->
        <div>
          <p class="mb-2 text-sm text-muted-foreground">手动输入 Token</p>
          <div class="flex gap-2">
            <Input
              v-model="manualToken"
              placeholder="粘贴或输入 QR Code Token"
              @keyup.enter="submit(manualToken)"
            />
            <Button :disabled="!manualToken.trim() || isSubmitting" @click="submit(manualToken)">
              <icon-lucide-loader2 v-if="isSubmitting" class="mr-1 h-4 w-4 animate-spin" />
              提交
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
