<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'
import { Button } from '@/components/common/ui/button'
import { cn } from '@/utils'

const open = defineModel<boolean>('open', { required: true })

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    contentClass?: HTMLAttributes['class']
    isSaving?: boolean
    saveText?: string
    cancelText?: string
  }>(),
  {
    description: '',
    contentClass: '',
    isSaving: false,
    saveText: '保存',
    cancelText: '取消',
  },
)

const emit = defineEmits<{
  cancel: []
  submit: []
}>()

const contentClass = computed(() =>
  cn('w-[calc(100vw-2rem)] max-w-md overflow-hidden sm:max-w-md', props.contentClass),
)

const handleOpenChange = (value: boolean) => {
  if (!value && props.isSaving) {
    return
  }

  open.value = value
  if (!value) {
    emit('cancel')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent :class="contentClass" :show-close-button="!isSaving">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription :class="description ? undefined : 'sr-only'">
          {{ description || title }}
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[calc(100vh-13rem)] overflow-y-auto py-4 pr-1">
        <slot />
      </div>

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="handleOpenChange(false)"
        >
          {{ cancelText }}
        </Button>
        <Button type="button" :disabled="isSaving" @click="emit('submit')">
          <icon-lucide-loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
          {{ isSaving ? '保存中...' : saveText }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
