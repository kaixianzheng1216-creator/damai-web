<script setup lang="ts">
import type { WorkOrderDetailVO } from '@/api/trade'
import WorkOrderDetailDialog from '@/components/common/WorkOrderDetailDialog.vue'

defineProps<{
  open: boolean
  workOrder?: WorkOrderDetailVO
  isLoading?: boolean
  isReplying?: boolean
  isClosing?: boolean
  replyError?: string
  isConnected?: boolean
}>()

const replyContent = defineModel<string>('replyContent', { required: true })

const emit = defineEmits<{
  close: []
  reply: []
  'close-work-order': []
}>()
</script>

<template>
  <WorkOrderDetailDialog
    :open="open"
    :work-order="workOrder"
    :is-loading="isLoading"
    :is-replying="isReplying"
    :is-closing="isClosing"
    :reply-error="replyError"
    :is-connected="isConnected"
    mode="user"
    v-model:reply-content="replyContent"
    @close="emit('close')"
    @reply="emit('reply')"
    @close-work-order="emit('close-work-order')"
  />
</template>
