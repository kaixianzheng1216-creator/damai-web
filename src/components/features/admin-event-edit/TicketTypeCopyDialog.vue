<script setup lang="ts">
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import type { SessionVO } from '@/api/event'
import { useTicketTypeCopyDialog } from '@/composables/admin'

interface Props {
  open: boolean
  eventId: string
  sourceSession: SessionVO | null
  allSessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

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
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>复制票种到其他场次</DialogTitle>
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
              @click="toggleCopyTarget(session.id)"
            >
              <input
                type="checkbox"
                :checked="copyTargetSessionIds.includes(session.id)"
                class="h-4 w-4 cursor-pointer"
                @click.stop="toggleCopyTarget(session.id)"
              />
              <span class="text-sm">{{ session.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button
          type="button"
          :disabled="copyTicketTypesMutation.isPending.value"
          @click="handleCopyTicketTypes"
        >
          确认复制
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
