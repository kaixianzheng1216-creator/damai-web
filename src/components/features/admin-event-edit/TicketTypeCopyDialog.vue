<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/common/ui/button'
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
  setCopyTarget,
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

const handleTargetChecked = (sessionId: string, checked: boolean | 'indeterminate') => {
  setCopyTarget(sessionId, checked)
}

const handleTargetChange = (sessionId: string, event: Event) => {
  const target = event.target as HTMLInputElement | null
  handleTargetChecked(sessionId, target?.checked === true)
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
            <label
              v-for="session in targetSessions"
              :key="session.id"
              :for="`copy-target-${session.id}`"
              class="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/40"
            >
              <input
                :id="`copy-target-${session.id}`"
                type="checkbox"
                class="sr-only"
                :checked="copyTargetSessionIds.includes(session.id)"
                @change="handleTargetChange(session.id, $event)"
              />
              <span
                class="grid size-4 shrink-0 place-items-center rounded-[4px] border border-input shadow-xs"
                :class="
                  copyTargetSessionIds.includes(session.id)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-background text-transparent'
                "
                aria-hidden="true"
              >
                <icon-lucide-check class="size-3.5" />
              </span>
              <span class="text-sm">{{ session.name }}</span>
            </label>
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
