<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'
import { Button } from '@/components/common/ui/button'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    loading?: boolean
    confirmText?: string
    confirmDisabled?: boolean
  }>(),
  {
    description: '',
    loading: false,
    confirmText: '确认',
    confirmDisabled: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const handleOpenChange = (value: boolean) => {
  if (!value && !props.loading) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>

      <!-- 自定义内容区域 -->
      <slot />

      <DialogFooter>
        <Button type="button" variant="outline" :disabled="loading" @click="emit('close')">
          取消
        </Button>
        <Button
          type="button"
          :disabled="confirmDisabled || loading"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
