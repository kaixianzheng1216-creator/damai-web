<script setup lang="ts">
import { computed, ref, onUnmounted, watch, nextTick } from 'vue'
import type { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import { useMutation } from '@tanstack/vue-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/common/ui/alert'
import { Badge } from '@/components/common/ui/badge'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { adminCheckinTicket } from '@/api/ticket/ticket'
import type { TicketVO } from '@/api/ticket'
import { formatDateTime } from '@/utils/format'
import { getTicketStatusClass } from '@/utils/statusMappers'

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
const checkedTicket = ref<TicketVO | null>(null)
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
  onSuccess: (ticket) => {
    checkedTicket.value = ticket
    showResult('success', '检票成功')
    manualToken.value = ''
    lastScannedToken.value = ''
  },
  onError: (error) => {
    checkedTicket.value = null
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
  checkedTicket.value = null
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
  checkedTicket.value = null
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
      checkedTicket.value = null
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
      class="w-[calc(100vw-2rem)] max-w-xl"
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

        <div v-if="checkedTicket" class="rounded-lg border bg-muted/20 p-4">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm text-muted-foreground">{{ checkedTicket.ticketNo }}</p>
              <h3 class="mt-1 line-clamp-2 font-semibold leading-snug">
                {{ checkedTicket.eventNameSnapshot }}
              </h3>
            </div>
            <Badge class="shrink-0" :class="getTicketStatusClass(checkedTicket.status)">
              {{ checkedTicket.statusLabel }}
            </Badge>
          </div>

          <dl class="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-muted-foreground">购票人</dt>
              <dd class="font-medium">{{ checkedTicket.passengerNameSnapshot }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">证件信息</dt>
              <dd class="font-medium">身份证 {{ checkedTicket.passengerIdNoMaskedSnapshot }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">场馆</dt>
              <dd class="font-medium">{{ checkedTicket.venueNameSnapshot }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">场馆地址</dt>
              <dd class="font-medium">{{ checkedTicket.venueAddressSnapshot }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">场次</dt>
              <dd class="font-medium">
                {{ formatDateTime(checkedTicket.sessionStartAtSnapshot, '--') }}
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground">票档</dt>
              <dd class="font-medium">{{ checkedTicket.ticketTypeNameSnapshot }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">订单号</dt>
              <dd class="break-all font-medium">{{ checkedTicket.orderNo }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">二维码 Token</dt>
              <dd class="break-all font-medium">{{ checkedTicket.qrCodeToken }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground">使用时间</dt>
              <dd class="font-medium">{{ formatDateTime(checkedTicket.usedAt, '--') }}</dd>
            </div>
          </dl>
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
