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
    isSaving?: boolean
    isEditing?: boolean
  }>(),
  {
    description: '',
    isSaving: false,
    isEditing: false,
  },
)

const emit = defineEmits<{
  close: []
  submit: []
}>()

const handleOpenChange = (value: boolean) => {
  if (!value && !props.isSaving) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-md overflow-hidden sm:max-w-md"
      :show-close-button="!isSaving"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>

      <!-- 表单内容区域 -->
      <div class="grid gap-4 py-4">
        <slot />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" :disabled="isSaving" @click="emit('close')">
          取消
        </Button>
        <Button type="button" :disabled="isSaving" @click="emit('submit')">
          <icon-lucide-loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ isSaving ? '保存中...' : isEditing ? '保存' : '创建' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
