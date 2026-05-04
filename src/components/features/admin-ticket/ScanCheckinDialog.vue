<script setup lang="ts">
import { computed, ref, onUnmounted, watch, nextTick } from 'vue'
import type { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import { useMutation } from '@tanstack/vue-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/common/ui/alert'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { adminCheckinTicket } from '@/api/ticket/ticket'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const getTicketCheckinErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  return '检票失败，请重试'
}

const videoRef = ref<HTMLVideoElement>()
const manualToken = ref('')
const lastScannedToken = ref('')
const result = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const scanCompleted = ref(false)

// Dynamic import state
const zxingReaderClass = ref<typeof BrowserQRCodeReader | null>(null)
const loadingScanner = ref(false)
const importError = ref(false)
let zxingImportPromise: Promise<typeof import('@zxing/browser')> | null = null
let pendingImport = false

let controls: IScannerControls | null = null

const checkinMutation = useMutation({
  mutationFn: adminCheckinTicket,
  onSuccess: (_data, token) => {
    showResult('success', `检票成功：${token}`)
    manualToken.value = ''
    lastScannedToken.value = ''
  },
  onError: (error) => {
    showResult('error', getTicketCheckinErrorMessage(error))
  },
})

const isSubmitting = computed(() => checkinMutation.isPending.value)

const stopScanner = () => {
  controls?.stop()
  controls = null
}

const showResult = (type: 'success' | 'error', message: string) => {
  result.value = { type, message }
  stopScanner()
  scanCompleted.value = true
}

const submit = (token: string) => {
  const t = token.trim()
  if (!t || checkinMutation.isPending.value) return
  checkinMutation.mutate(t)
}

const resetTokenTimeout = useTimeoutFn(() => {
  lastScannedToken.value = ''
}, 2000)

const debouncedSubmit = useDebounceFn((token: string) => {
  submit(token)
  resetTokenTimeout.start()
}, 300)

const handleScanResult = (token: string) => {
  if (token === lastScannedToken.value) return
  lastScannedToken.value = token
  debouncedSubmit(token)
}

const startScanner = async () => {
  const ReaderClass = zxingReaderClass.value
  if (!videoRef.value || !ReaderClass) return
  stopScanner()
  result.value = null
  scanCompleted.value = false

  try {
    const reader = new ReaderClass()
    controls = await reader.decodeFromVideoDevice(undefined, videoRef.value, (res, _err) => {
      if (res) handleScanResult(res.getText())
    })
  } catch (error) {
    console.error('[ScanCheckin] Scan failed:', error)
    showResult('error', '摄像头启动失败，请检查权限或使用手动输入')
  }
}

const resetAndRestart = async () => {
  result.value = null
  scanCompleted.value = false
  await nextTick()
  startScanner()
}

const handleOpen = (val: boolean) => {
  if (!val && isSubmitting.value) {
    return
  }
  if (!val) {
    stopScanner()
    pendingImport = false
  }
  emit('update:open', val)
}

const doImportAndStart = async () => {
  importError.value = false

  if (!zxingImportPromise) {
    loadingScanner.value = true
    zxingImportPromise = import('@zxing/browser')
  }

  try {
    const module = await Promise.race([
      zxingImportPromise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ])
    loadingScanner.value = false
    zxingReaderClass.value = module.BrowserQRCodeReader

    if (pendingImport) {
      // Wait for next tick to ensure video element is rendered
      await nextTick()
      startScanner()
    }
  } catch (error) {
    console.error('[ScanCheckin] Scanner cleanup failed:', error)
    loadingScanner.value = false
    importError.value = true
    zxingImportPromise = null // Allow retry
  }
}

const retryImport = () => {
  doImportAndStart()
}

// 监听对话框打开状态，打开时动态加载扫码库并启动摄像头
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      result.value = null
      scanCompleted.value = false
      pendingImport = true
      doImportAndStart()
    }
  },
)

onUnmounted(stopScanner)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpen">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-md"
      :show-close-button="!isSubmitting"
      @open-auto-focus.prevent
    >
      <DialogHeader>
        <DialogTitle>扫码检票</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- 摄像头区域 -->
        <template v-if="!scanCompleted">
          <!-- 加载扫码模块中 -->
          <div
            v-if="loadingScanner"
            class="relative overflow-hidden rounded-lg bg-black aspect-square flex-center"
          >
            <div class="flex flex-col items-center gap-3 text-white">
              <icon-lucide-loader2 class="h-8 w-8 animate-spin" />
              <span class="text-sm">正在加载扫描模块...</span>
            </div>
          </div>

          <!-- 加载失败 -->
          <div
            v-else-if="importError"
            class="relative overflow-hidden rounded-lg bg-muted aspect-square flex-center"
          >
            <div class="flex flex-col items-center gap-3 text-muted-foreground">
              <icon-lucide-alert-triangle class="h-8 w-8" />
              <span class="text-sm">扫描模块加载失败</span>
              <Button variant="outline" size="sm" @click="retryImport">
                <icon-lucide-refresh-cw class="mr-1 h-4 w-4" />
                重试
              </Button>
            </div>
          </div>

          <!-- 摄像头 -->
          <div v-else class="relative overflow-hidden rounded-lg bg-black aspect-square">
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
        </template>

        <!-- 结果提示 (扫描完成时持久显示) -->
        <Alert v-if="result" :variant="result.type === 'success' ? undefined : 'destructive'">
          <icon-lucide-check-circle v-if="result.type === 'success'" class="h-4 w-4" />
          <icon-lucide-x-circle v-else class="h-4 w-4" />
          <AlertTitle>{{ result.type === 'success' ? '成功' : '失败' }}</AlertTitle>
          <AlertDescription>{{ result.message }}</AlertDescription>
        </Alert>

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
