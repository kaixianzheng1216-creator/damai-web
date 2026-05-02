<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Checkbox } from '@/components/common/ui/checkbox'
import { Label } from '@/components/common/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/ui/dialog'
import type { SessionVO } from '@/api/event'
import { useTicketTypeCopyDialog } from '@/composables/admin'

const props = defineProps<{
  open: boolean
  eventId: string
  sourceSession: SessionVO | null
  allSessions: SessionVO[] | undefined
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  copied: []
}>()

const {
  copyTargetSessionIds,
  targetSessions,
  copyTicketTypesMutation,
  toggleCopyTarget,
  handleCopyTicketTypes,
} = useTicketTypeCopyDialog({
  eventId: () => props.eventId,
  sourceSession: () => props.sourceSession,
  allSessions: () => props.allSessions,
  onOpenChange: (open) => emit('update:open', open),
  onCopied: () => emit('copied'),
})

const isCopying = computed(() => copyTicketTypesMutation.isPending.value)

const handleOpenChange = (value: boolean) => {
  if (!value && !isCopying.value) {
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-md overflow-hidden sm:max-w-md"
      :show-close-button="!isCopying"
    >
      <DialogHeader>
        <DialogTitle>复制票种到其他场次</DialogTitle>
        <DialogDescription>选择目标场次后，会复制当前场次下的全部票种配置。</DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="text-sm text-muted-foreground">
          源场次：<span class="font-medium text-foreground">{{ sourceSession?.name }}</span>
        </div>
        <div class="grid gap-2">
          <Label>选择目标场次</Label>
          <div class="space-y-2">
            <div
              v-for="session in targetSessions"
              :key="session.id"
              class="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                :id="`copy-target-${session.id}`"
                :checked="copyTargetSessionIds.includes(session.id)"
                @update:checked="() => toggleCopyTarget(session.id)"
              />
              <Label :for="`copy-target-${session.id}`" class="cursor-pointer text-sm">
                {{ session.name }}
              </Label>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="isCopying"
          @click="handleOpenChange(false)"
        >
          取消
        </Button>
        <Button type="button" :disabled="isCopying" @click="handleCopyTicketTypes">
          {{ isCopying ? '复制中...' : '确认复制' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
