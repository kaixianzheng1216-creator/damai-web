<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/common/ui/alert-dialog'
import { Button } from '@/components/common/ui/button'
import type { ConfirmDialogVariant } from '@/composables/common/useConfirmDialog'

defineProps<{
  open: boolean
  title: string
  description: string
  confirmText?: string
  confirmVariant?: ConfirmDialogVariant
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <AlertDialog :open="open" @update:open="(val) => !val && emit('close')">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="loading" @click="emit('close')">取消</AlertDialogCancel>
        <Button
          type="button"
          :variant="confirmVariant ?? 'default'"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <icon-lucide-loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          {{ loading ? '处理中...' : (confirmText ?? '确认') }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
