<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/common/ui/dialog'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [reason: string]
  close: []
}>()

const reason = ref('')
const error = ref('')
const maxLength = 200

watch(
  () => props.open,
  (val) => {
    if (val) {
      reason.value = ''
      error.value = ''
    }
  },
)

const handleSubmit = () => {
  const trimmed = reason.value.trim()
  if (!trimmed) {
    error.value = '请输入退款原因'
    return
  }
  if (trimmed.length > maxLength) {
    error.value = `退款原因不能超过 ${maxLength} 字`
    return
  }
  error.value = ''
  emit('submit', trimmed)
}

const handleClose = () => {
  if (props.loading) return
  emit('close')
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && handleClose()">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
      <DialogHeader>
        <DialogTitle>申请退款</DialogTitle>
        <DialogDescription>请填写退款原因，提交后将进入退款审核流程。</DialogDescription>
      </DialogHeader>
      <div class="space-y-3">
        <div>
          <Label for="refund-reason" class="mb-2 block">
            退款原因
            <span class="text-destructive">*</span>
          </Label>
          <textarea
            id="refund-reason"
            v-model="reason"
            rows="4"
            :maxlength="maxLength"
            :disabled="loading"
            placeholder="请详细描述退款原因..."
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            @keydown.enter.prevent
          />
          <div class="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span v-if="error" class="text-destructive">{{ error }}</span>
            <span v-else>&nbsp;</span>
            <span>{{ reason.length }}/{{ maxLength }}</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" :disabled="loading" @click="handleClose">取消</Button>
        <Button :disabled="loading" @click="handleSubmit">
          <icon-lucide-loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          提交申请
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
