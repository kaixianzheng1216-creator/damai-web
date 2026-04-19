<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import { copyTicketTypes } from '@/api/event/event'
import type { SessionVO } from '@/api/event'

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

const queryClient = useQueryClient()

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const copyTargetSessionIds = ref<string[]>([])

watch(
  () => props.sourceSession,
  () => {
    copyTargetSessionIds.value = []
  },
)

const toggleCopyTarget = (sessionId: string) => {
  const idx = copyTargetSessionIds.value.indexOf(sessionId)
  if (idx === -1) {
    copyTargetSessionIds.value.push(sessionId)
  } else {
    copyTargetSessionIds.value.splice(idx, 1)
  }
}

const copyTicketTypesMutation = useMutation({
  mutationFn: ({
    sourceSessionId,
    targetSessionIds,
  }: {
    sourceSessionId: string
    targetSessionIds: string[]
  }) => copyTicketTypes(props.eventId, { sourceSessionId, targetSessionIds }),
  onSuccess: () => {
    toast.success('票种复制成功')
    emit('update:open', false)
    invalidateAll()
    emit('copied')
  },
  onError: () => {
    toast.error('复制失败')
  },
})

const handleCopyTicketTypes = async () => {
  if (!props.sourceSession) return
  if (copyTargetSessionIds.value.length === 0) {
    toast.error('请选择目标场次')
    return
  }
  await copyTicketTypesMutation.mutateAsync({
    sourceSessionId: props.sourceSession.id,
    targetSessionIds: copyTargetSessionIds.value,
  })
}
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
              v-for="session in allSessions?.filter((s) => s.id !== sourceSession?.id)"
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
        <Button variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button @click="handleCopyTicketTypes">确认复制</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
