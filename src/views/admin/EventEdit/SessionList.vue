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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/common/ui/dropdown-menu'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { batchAddSessions, updateSession, deleteSession } from '@/api/event/event'
import { formatDateTime, formatDateTimeLocalInput } from '@/utils/format'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import type { SessionVO, SessionItem, SessionUpdateRequest } from '@/api/event'

interface Props {
  eventId: string
  sessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
  'create-ticket-type': [sessionId: string]
  'edit-ticket-type': [ticketType: any]
  'adjust-inventory': [ticketType: any]
  'delete-ticket-type': [ticketType: any]
  'copy-ticket-types': [session: SessionVO]
}>()

const queryClient = useQueryClient()

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

// ─── Confirm Dialog ───────────────────────────────────────

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

// ─── Session ──────────────────────────────────────────────

const showSessionDialog = ref(false)
const editingSessionId = ref<string | null>(null)

const sessionForm = reactive<SessionItem & Partial<SessionUpdateRequest>>({
  name: '',
  startAt: '',
  endAt: '',
})

const batchSessionRows = ref<Array<{ name: string; startAt: string; endAt: string }>>([
  { name: '', startAt: '', endAt: '' },
])

const addBatchRow = () => {
  batchSessionRows.value.push({ name: '', startAt: '', endAt: '' })
}

const removeBatchRow = (idx: number) => {
  if (batchSessionRows.value.length > 1) {
    batchSessionRows.value.splice(idx, 1)
  }
}

const openSessionCreate = () => {
  batchSessionRows.value = [{ name: '', startAt: '', endAt: '' }]
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
  if (editingSessionId.value) {
    if (!sessionForm.name) {
      toast.error('请填写场次名称')
      return
    }
    await updateSessionMutation.mutateAsync({
      sessionId: editingSessionId.value,
      data: sessionForm,
    })
  } else {
    const validRows = batchSessionRows.value.filter((r) => r.name)
    if (validRows.length === 0) {
      toast.error('请至少填写一个场次名称')
      return
    }
    await batchAddSessionsMutation.mutateAsync(validRows)
  }
}

const handleDeleteSession = (session: SessionVO) => {
  openConfirm('确认删除', `确认删除场次「${session.name}」？`, () =>
    deleteSessionMutation.mutate(session.id),
  )
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold">场次与票种</h3>
      <Button @click="openSessionCreate">添加场次</Button>
    </div>

    <!-- Empty -->
    <div
      v-if="!sessions || sessions.length === 0"
      class="text-center py-10 text-muted-foreground border rounded-lg"
    >
      暂无场次，点击右上角添加
    </div>

    <!-- Session Cards -->
    <div v-else class="space-y-3">
      <Card v-for="session in sessions" :key="session.id">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <CardTitle class="text-base">{{ session.name }}</CardTitle>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ formatDateTime(session.startAt!) }} — {{ formatDateTime(session.endAt!) }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <Button
                v-if="session.ticketTypes && session.ticketTypes.length > 0"
                variant="outline"
                size="sm"
                @click="emit('create-ticket-type', session.id)"
              >
                + 添加票种
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-muted-foreground"
                    >···</Button
                  >
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openSessionEdit(session)">编辑场次</DropdownMenuItem>
                  <DropdownMenuItem @click="emit('copy-ticket-types', session)"
                    >复制票种到其他场次</DropdownMenuItem
                  >
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click="handleDeleteSession(session)"
                  >
                    删除场次
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            v-if="!session.ticketTypes || session.ticketTypes.length === 0"
            class="w-full text-sm text-muted-foreground text-center py-5 border border-dashed rounded-md hover:border-primary hover:text-primary transition-colors cursor-pointer"
            @click="emit('create-ticket-type', session.id)"
          >
            + 新增票种
          </button>
          <div v-else class="space-y-2">
            <div
              v-for="tt in session.ticketTypes"
              :key="tt.id"
              class="flex items-center justify-between p-3 bg-muted/40 rounded-md"
            >
              <div>
                <div class="font-medium text-sm">{{ tt.name }}</div>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="emit('edit-ticket-type', tt)"
                  >编辑</Button
                >
                <Button variant="outline" size="sm" @click="emit('adjust-inventory', tt)"
                  >调整库存</Button
                >
                <Button variant="outline" size="sm" @click="emit('delete-ticket-type', tt)">
                  删除
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Session Dialog -->
  <Dialog :open="showSessionDialog" @update:open="(v) => !v && (showSessionDialog = false)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ editingSessionId ? '编辑场次' : '批量添加场次' }}</DialogTitle>
      </DialogHeader>

      <!-- Edit mode: single row form -->
      <div v-if="editingSessionId" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>场次名称 <span class="text-destructive">*</span></Label>
          <Input v-model="sessionForm.name" placeholder="请输入场次名称" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>开始时间</Label>
            <DateTimePicker v-model="sessionForm.startAt" placeholder="选择开始时间" />
          </div>
          <div class="grid gap-2">
            <Label>结束时间</Label>
            <DateTimePicker v-model="sessionForm.endAt" placeholder="选择结束时间" />
          </div>
        </div>
      </div>

      <!-- Create mode: batch rows -->
      <div v-else class="py-4 space-y-3">
        <div
          v-for="(row, idx) in batchSessionRows"
          :key="idx"
          class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end"
        >
          <div class="grid gap-1">
            <Label v-if="idx === 0">场次名称 <span class="text-destructive">*</span></Label>
            <Input v-model="row.name" placeholder="请输入场次名称" />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0">开始时间</Label>
            <Input v-model="row.startAt" type="datetime-local" />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0">结束时间</Label>
            <Input v-model="row.endAt" type="datetime-local" />
          </div>
          <Button
            variant="outline"
            size="sm"
            class="text-destructive hover:text-destructive"
            :disabled="batchSessionRows.length <= 1"
            @click="removeBatchRow(idx)"
          >
            删除
          </Button>
        </div>
        <Button variant="outline" size="sm" @click="addBatchRow">+ 添加一行</Button>
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
