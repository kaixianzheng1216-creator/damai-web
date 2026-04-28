<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { checkinTicket } from '@/api/ticket/ticket'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const videoRef = ref<HTMLVideoElement>()
const manualToken = ref('')
const isSubmitting = ref(false)
const lastScannedToken = ref('')
const result = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const scanCompleted = ref(false)

let controls: IScannerControls | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const stopScanner = () => {
  controls?.stop()
  controls = null
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

const showResult = (type: 'success' | 'error', message: string) => {
  result.value = { type, message }
  stopScanner()
  scanCompleted.value = true
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
  scanCompleted.value = false

  try {
    const reader = new BrowserQRCodeReader()
    controls = await reader.decodeFromVideoDevice(undefined, videoRef.value, (res, _err) => {
      if (res) handleScanResult(res.getText())
    })
  } catch {
    showResult('error', '摄像头启动失败，请检查权限或使用手动输入')
  }
}

const resetAndRestart = () => {
  result.value = null
  scanCompleted.value = false
  setTimeout(() => {
    startScanner()
  }, 100)
}

const handleOpen = (val: boolean) => {
  if (!val) {
    stopScanner()
  }
  emit('update:open', val)
}

// 监听对话框打开状态，打开时自动启动摄像头
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      result.value = null
      scanCompleted.value = false
      // 等待下一帧确保video元素已渲染
      setTimeout(() => {
        startScanner()
      }, 100)
    }
  },
)

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
        <div
          v-if="!scanCompleted"
          class="relative overflow-hidden rounded-lg bg-black aspect-square"
        >
          <video ref="videoRef" class="h-full w-full object-cover" autoplay muted playsinline />
          <!-- 扫描框 -->
          <div class="absolute inset-0 flex-center pointer-events-none">
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

        <!-- 结果提示 (扫描完成时持久显示) -->
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

        <!-- 继续扫描按钮 (仅在扫描完成后显示) -->
        <div v-if="scanCompleted" class="flex gap-2">
          <Button class="flex-1" @click="resetAndRestart">
            <icon-lucide-refresh-cw class="mr-1 h-4 w-4" />
            继续扫描
          </Button>
        </div>

        <!-- 手动输入 (仅在未扫描完成时显示) -->
        <div v-if="!scanCompleted">
          <label for="scan-manual-token" class="mb-2 block text-sm text-muted-foreground">
            手动输入 Token
          </label>
          <div class="flex gap-2">
            <Input
              id="scan-manual-token"
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
