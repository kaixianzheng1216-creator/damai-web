<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { WorkOrderDetailVO, WorkOrderReplyVO } from '@/api/trade'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/common/ui/dialog'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import ErrorState from '@/components/common/ErrorState.vue'
import TextareaField from '@/components/common/TextareaField.vue'
import { WORK_ORDER_STATUS } from '@/constants'
import { formatDateTime } from '@/utils/format'
import { getWorkOrderStatusBadgeClass } from '@/utils/statusMappers'

const props = defineProps<{
  open: boolean
  workOrder?: WorkOrderDetailVO
  isLoading?: boolean
  isReplying?: boolean
  isClosing?: boolean
  replyError?: string
  isConnected?: boolean
  mode: 'user' | 'admin'
}>()

const replyContent = defineModel<string>('replyContent', { required: true })

const emit = defineEmits<{
  close: []
  reply: []
  'close-work-order': []
}>()

const replies = computed(() => props.workOrder?.replies ?? [])
const isClosed = computed(() => props.workOrder?.status === WORK_ORDER_STATUS.CLOSED)
const isProcessing = computed(() => Boolean(props.isReplying || props.isClosing))
const canReply = computed(
  () =>
    replyContent.value.trim().length > 0 &&
    !isClosed.value &&
    !props.isReplying &&
    props.isConnected !== false,
)

const isUserReply = (reply: WorkOrderReplyVO) => reply.senderType === 0

const isUserAlignRight = computed(() => props.mode === 'user')

const getReplyJustify = (reply: WorkOrderReplyVO) => {
  const isUser = isUserReply(reply)
  const isRight = isUserAlignRight.value ? isUser : !isUser
  return isRight ? 'justify-end' : 'justify-start'
}

const getReplyBubbleClass = (reply: WorkOrderReplyVO) => {
  const isUser = isUserReply(reply)
  const isPrimary = isUserAlignRight.value ? isUser : !isUser
  return isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
}

const getReplyMetaClass = (reply: WorkOrderReplyVO) => {
  const isUser = isUserReply(reply)
  const isPrimary = isUserAlignRight.value ? isUser : !isUser
  return isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
}

const getReplyLabel = (reply: WorkOrderReplyVO) => {
  const isUser = isUserReply(reply)
  if (props.mode === 'user') {
    return isUser ? '我' : '客服'
  }
  return isUser ? '用户' : '客服'
}

const textareaLabel = computed(() => {
  const base = props.mode === 'admin' ? '客服回复' : '回复内容'
  return props.isConnected === false ? `${base}（连接中...）` : base
})

const descLabel = computed(() => (props.mode === 'admin' ? '用户问题' : '问题描述'))

const closedMessage = computed(() =>
  props.mode === 'admin' ? '该工单已关闭。' : '该工单已关闭，无法继续回复。',
)

const messagesRef = ref<HTMLDivElement | null>(null)
const bottomRef = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(
  replies,
  async () => {
    await nextTick()
    scrollToBottom()
  },
  { deep: true },
)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      scrollToBottom()
    }
  },
)

const handleOpenChange = (value: boolean) => {
  if (!value && !isProcessing.value) {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (canReply.value) {
      emit('reply')
    }
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogScrollContent
      class="my-4 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-4xl flex-col gap-4 overflow-hidden p-4 sm:my-8 sm:max-h-[calc(100vh-4rem)] sm:p-6"
      :show-close-button="!isProcessing"
    >
      <DialogHeader class="shrink-0 space-y-2 pr-8">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <DialogTitle class="text-lg leading-tight sm:text-xl">
            {{ workOrder?.title || '工单详情' }}
          </DialogTitle>
          <Badge v-if="workOrder" :class="getWorkOrderStatusBadgeClass(workOrder.status)">
            {{ workOrder.statusLabel }}
          </Badge>
        </div>
        <DialogDescription>
          工单号：{{ workOrder?.workOrderNo || workOrder?.id || '-' }}
        </DialogDescription>
      </DialogHeader>

      <div ref="messagesRef" class="min-h-0 flex-1 overflow-y-auto pr-1">
        <div v-if="isLoading" class="flex min-h-80 items-center justify-center">
          <icon-lucide-loader2 class="size-8 animate-spin text-primary" />
        </div>

        <ErrorState
          v-else-if="!workOrder"
          class="min-h-80"
          title="工单详情加载失败"
          description="请关闭弹窗后重新打开。"
        />

        <div v-else class="space-y-4">
          <div
            class="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm sm:grid-cols-2 lg:grid-cols-3"
          >
            <div v-if="mode === 'admin'" class="flex items-center gap-2">
              <icon-lucide-user class="size-4 text-muted-foreground" />
              <span class="text-muted-foreground">用户 ID</span>
              <span class="font-medium">{{ workOrder.userId || '-' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <icon-lucide-tags class="size-4 text-muted-foreground" />
              <span class="text-muted-foreground">类型</span>
              <span class="font-medium">{{ workOrder.typeLabel || '其他' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <icon-lucide-clock class="size-4 text-muted-foreground" />
              <span class="text-muted-foreground">创建时间</span>
              <span class="font-medium">{{ formatDateTime(workOrder.createAt, '-') }}</span>
            </div>
            <div class="flex min-w-0 items-center gap-2">
              <icon-lucide-file-text class="size-4 shrink-0 text-muted-foreground" />
              <span class="shrink-0 text-muted-foreground">关联订单</span>
              <span class="truncate font-medium">{{ workOrder.relatedOrderId || '-' }}</span>
            </div>
            <div class="flex min-w-0 items-center gap-2">
              <icon-lucide-ticket class="size-4 shrink-0 text-muted-foreground" />
              <span class="shrink-0 text-muted-foreground">关联票券</span>
              <span class="truncate font-medium">{{ workOrder.relatedTicketId || '-' }}</span>
            </div>
          </div>

          <section class="rounded-lg border border-border p-3">
            <div class="mb-2 flex items-center gap-2 text-sm font-medium">
              <icon-lucide-message-square-text class="size-4 text-primary" />
              {{ descLabel }}
            </div>
            <p class="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {{ workOrder.content || '-' }}
            </p>
          </section>

          <section class="space-y-3">
            <div class="flex items-center gap-2 text-sm font-medium">
              <icon-lucide-messages-square class="size-4 text-primary" />
              沟通记录
            </div>

            <div
              v-if="!replies.length"
              class="rounded-lg border border-dashed border-border p-6 text-center"
            >
              <p class="text-sm text-muted-foreground">暂无回复</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="reply in replies"
                :key="reply.id"
                class="flex"
                :class="getReplyJustify(reply)"
              >
                <div
                  class="max-w-[86%] rounded-lg px-3 py-2 text-sm shadow-sm md:max-w-[72%]"
                  :class="getReplyBubbleClass(reply)"
                >
                  <div
                    class="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
                    :class="getReplyMetaClass(reply)"
                  >
                    <span>{{ getReplyLabel(reply) }}</span>
                    <span>{{ formatDateTime(reply.createAt, '-') }}</span>
                  </div>
                  <p class="whitespace-pre-wrap break-words leading-6">{{ reply.content }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div ref="bottomRef" />
      </div>

      <template v-if="workOrder && !isLoading">
        <TextareaField
          v-if="!isClosed"
          id="work-order-reply"
          v-model="replyContent"
          :label="textareaLabel"
          placeholder="输入回复内容，按回车发送，Shift+回车换行"
          :max-length="2000"
          :rows="3"
          :disabled="isProcessing || isConnected === false"
          :error="replyError"
          @keydown="handleKeydown"
        />

        <div
          v-else
          class="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
        >
          {{ closedMessage }}
        </div>

        <DialogFooter
          class="shrink-0 flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end"
        >
          <Button type="button" variant="outline" :disabled="isProcessing" @click="emit('close')">
            返回
          </Button>
          <Button
            v-if="!isClosed"
            type="button"
            variant="outline"
            :disabled="isClosing"
            @click="emit('close-work-order')"
          >
            <icon-lucide-lock class="mr-1.5 size-4" />
            关闭工单
          </Button>
          <Button v-if="!isClosed" type="button" :disabled="!canReply" @click="emit('reply')">
            <icon-lucide-send class="mr-1.5 size-4" />
            {{ isReplying ? '发送中' : '发送回复' }}
          </Button>
        </DialogFooter>
      </template>
    </DialogScrollContent>
  </Dialog>
</template>
