<script setup lang="ts">
import { computed } from 'vue'
import type { WorkOrderReplyVO, WorkOrderDetailVO } from '@/api/trade'
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
import { Label } from '@/components/common/ui/label'
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
}>()

const replyContent = defineModel<string>('replyContent', { required: true })

const emit = defineEmits<{
  close: []
  'submit-reply': []
  'close-work-order': []
}>()

const replies = computed(() => props.workOrder?.replies ?? [])
const isClosed = computed(() => props.workOrder?.status === WORK_ORDER_STATUS.CLOSED)
const canSubmitReply = computed(
  () => replyContent.value.trim().length > 0 && !isClosed.value && !props.isReplying,
)

const isUserReply = (reply: WorkOrderReplyVO) => reply.senderType === 0
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogScrollContent
      class="my-4 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-3xl flex-col gap-4 overflow-hidden p-4 sm:my-8 sm:max-h-[calc(100vh-4rem)] sm:p-6"
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

      <div class="min-h-0 flex-1 overflow-y-auto pr-1">
        <div v-if="isLoading" class="flex min-h-80 items-center justify-center">
          <icon-lucide-loader2 class="size-8 animate-spin text-primary" />
        </div>

        <div
          v-else-if="!workOrder"
          class="flex min-h-80 flex-col items-center justify-center gap-2"
        >
          <icon-lucide-inbox class="size-10 text-muted-foreground/50" />
          <p class="text-sm text-muted-foreground">工单详情加载失败</p>
        </div>

        <div v-else class="space-y-4">
          <div
            class="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm sm:grid-cols-2"
          >
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
            <div v-if="workOrder.relatedOrderId" class="flex min-w-0 items-center gap-2">
              <icon-lucide-file-text class="size-4 shrink-0 text-muted-foreground" />
              <span class="shrink-0 text-muted-foreground">关联订单</span>
              <span class="truncate font-medium">{{ workOrder.relatedOrderId }}</span>
            </div>
            <div v-if="workOrder.relatedTicketId" class="flex min-w-0 items-center gap-2">
              <icon-lucide-ticket class="size-4 shrink-0 text-muted-foreground" />
              <span class="shrink-0 text-muted-foreground">关联票券</span>
              <span class="truncate font-medium">{{ workOrder.relatedTicketId }}</span>
            </div>
          </div>

          <section class="rounded-lg border border-border p-3">
            <div class="mb-2 flex items-center gap-2 text-sm font-medium">
              <icon-lucide-message-square-text class="size-4 text-primary" />
              问题描述
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
                :class="isUserReply(reply) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[86%] rounded-lg px-3 py-2 text-sm shadow-sm sm:max-w-[72%]"
                  :class="
                    isUserReply(reply)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  "
                >
                  <div
                    class="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
                    :class="
                      isUserReply(reply) ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    "
                  >
                    <span>{{ isUserReply(reply) ? '我' : '客服' }}</span>
                    <span>{{ formatDateTime(reply.createAt, '-') }}</span>
                  </div>
                  <p class="whitespace-pre-wrap break-words leading-6">{{ reply.content }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <template v-if="workOrder && !isLoading">
        <div v-if="!isClosed" class="space-y-2">
          <Label for="work-order-reply">回复内容</Label>
          <textarea
            id="work-order-reply"
            v-model="replyContent"
            maxlength="2000"
            rows="3"
            class="min-h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            placeholder="输入回复内容"
          />
          <div class="flex items-center justify-between gap-3 text-xs">
            <p class="text-destructive">{{ replyError }}</p>
            <span class="ml-auto text-muted-foreground">{{ replyContent.length }}/2000</span>
          </div>
        </div>

        <div
          v-else
          class="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
        >
          该工单已关闭，无法继续回复。
        </div>

        <DialogFooter
          class="shrink-0 border-t border-border pt-3 flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <Button variant="outline" @click="emit('close')">返回</Button>
          <Button
            v-if="!isClosed"
            variant="outline"
            :disabled="isClosing"
            @click="emit('close-work-order')"
          >
            <icon-lucide-lock class="mr-1.5 size-4" />
            关闭工单
          </Button>
          <Button v-if="!isClosed" :disabled="!canSubmitReply" @click="emit('submit-reply')">
            <icon-lucide-send class="mr-1.5 size-4" />
            {{ isReplying ? '发送中' : '发送回复' }}
          </Button>
        </DialogFooter>
      </template>
    </DialogScrollContent>
  </Dialog>
</template>
