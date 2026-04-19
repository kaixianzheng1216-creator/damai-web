<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { batchAddSessions, updateSession, deleteSession } from '@/api/event/event'
import { formatDateTime, formatDateTimeLocalInput } from '@/utils/format'
import type { SessionVO, SessionItem, SessionUpdateRequest } from '@/api/event'

interface Props {
  eventId: string
  sessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

const showSessionDialog = ref(false)
const editingSessionId = ref<string | null>(null)

const sessionForm = reactive<SessionItem & Partial<SessionUpdateRequest>>({
  name: '',
  startAt: '',
  endAt: '',
})

const resetSessionForm = () => {
  sessionForm.name = ''
  sessionForm.startAt = ''
  sessionForm.endAt = ''
}

const openSessionCreate = () => {
  resetSessionForm()
  editingSessionId.value = null
  showSessionDialog.value = true
}

const openSessionEdit = (session: SessionVO) => {
  sessionForm.name = session.name
  sessionForm.startAt = formatDateTimeLocalInput(session.startAt!)
  sessionForm.endAt = formatDateTimeLocalInput(session.endAt!)
  editingSessionId.value = session.id
  showSessionDialog.value = true
}

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const batchAddSessionsMutation = useMutation({
  mutationFn: (sessions: SessionItem[]) => batchAddSessions(props.eventId, { sessions }),
  onSuccess: () => {
    toast.success('场次添加成功')
    showSessionDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('添加失败')
  },
})

const updateSessionMutation = useMutation({
  mutationFn: ({ sessionId, data }: { sessionId: string; data: SessionUpdateRequest }) =>
    updateSession(props.eventId, sessionId, data),
  onSuccess: () => {
    toast.success('场次更新成功')
    showSessionDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('更新失败')
  },
})

const deleteSessionMutation = useMutation({
  mutationFn: (sessionId: string) => deleteSession(props.eventId, sessionId),
  onSuccess: () => {
    toast.success('场次删除成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('删除失败')
  },
})

const handleSaveSession = async () => {
  if (!sessionForm.name) {
    toast.error('请填写场次名称')
    return
  }

  if (editingSessionId.value) {
    await updateSessionMutation.mutateAsync({
      sessionId: editingSessionId.value,
      data: sessionForm,
    })
  } else {
    await batchAddSessionsMutation.mutateAsync([sessionForm])
  }
}

const handleDeleteSession = (session: SessionVO) => {
  openConfirm('确认删除', `确认删除场次「${session.name}」？`, () =>
    deleteSessionMutation.mutate(session.id),
  )
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => {
  confirmDialog.value.open = false
}
const handleConfirm = () => {
  confirmDialog.value.onConfirm()
  closeConfirm()
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>场次管理</CardTitle>
        <Button @click="openSessionCreate">添加场次</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="!sessions || sessions.length === 0" class="text-center py-4 text-muted-foreground">
        暂无场次
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="flex items-center justify-between p-3 border rounded-lg"
        >
          <div>
            <div class="font-medium">{{ session.name }}</div>
            <div class="text-sm text-muted-foreground">
              {{ formatDateTime(session.startAt!) }} - {{ formatDateTime(session.endAt!) }}
            </div>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="openSessionEdit(session)">编辑</Button>
            <Button size="sm" @click="handleDeleteSession(session)">删除</Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <Dialog :open="showSessionDialog" @update:open="(v) => !v && (showSessionDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ editingSessionId ? '编辑场次' : '添加场次' }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>场次名称 <span class="text-destructive">*</span></Label>
          <Input v-model="sessionForm.name" placeholder="请输入场次名称" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>开始时间</Label>
            <Input v-model="sessionForm.startAt" type="datetime-local" />
          </div>
          <div class="grid gap-2">
            <Label>结束时间</Label>
            <Input v-model="sessionForm.endAt" type="datetime-local" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showSessionDialog = false">取消</Button>
        <Button @click="handleSaveSession">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
