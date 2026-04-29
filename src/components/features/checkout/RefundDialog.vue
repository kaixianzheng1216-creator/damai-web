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
import TextareaField from '@/components/common/TextareaField.vue'

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
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md" :show-close-button="!loading">
      <DialogHeader>
        <DialogTitle>申请退款</DialogTitle>
        <DialogDescription>请填写退款原因，提交后将进入退款审核流程。</DialogDescription>
      </DialogHeader>
      <div class="space-y-3">
        <TextareaField
          id="refund-reason"
          v-model="reason"
          label="退款原因"
          placeholder="请详细描述退款原因..."
          required
          :rows="4"
          :max-length="maxLength"
          :disabled="loading"
          :error="error"
          @keydown.enter.prevent
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" :disabled="loading" @click="handleClose"
          >取消</Button
        >
        <Button type="button" :disabled="loading" @click="handleSubmit">
          <icon-lucide-loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          提交申请
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
