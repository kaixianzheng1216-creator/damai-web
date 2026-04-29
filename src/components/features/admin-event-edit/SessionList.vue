<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { FieldError } from '@/components/common/ui/field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/common/ui/dropdown-menu'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { formatDateTime } from '@/utils/format'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import type { SessionVO, TicketTypeVO } from '@/api/event'
import { useSessionList } from '@/composables/admin'

interface Props {
  eventId: string
  sessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
  'create-ticket-type': [sessionId: string]
  'edit-ticket-type': [ticketType: TicketTypeVO]
  'adjust-inventory': [ticketType: TicketTypeVO]
  'delete-ticket-type': [ticketType: TicketTypeVO]
  'copy-ticket-types': [session: SessionVO]
}>()

const {
  confirmDialog,
  showSessionDialog,
  editingSessionId,
  sessionError,
  sessionForm,
  batchSessionRows,
  batchAddSessionsMutation,
  updateSessionMutation,
  addBatchRow,
  removeBatchRow,
  openSessionCreate,
  openSessionEdit,
  handleSaveSession,
  handleDeleteSession,
  closeConfirm,
  handleConfirm,
} = useSessionList({
  eventId: () => props.eventId,
  onUpdated: () => emit('updated'),
})

const isSavingSession = computed(
  () => batchAddSessionsMutation.isPending.value || updateSessionMutation.isPending.value,
)

const handleSessionOpenChange = (value: boolean) => {
  if (!value && !isSavingSession.value) {
    showSessionDialog.value = false
  }
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
    <EmptyState
      v-if="!sessions || sessions.length === 0"
      class="min-h-40 rounded-lg border border-border"
      title="暂无场次"
      description="点击右上角添加场次后再配置票种。"
    />

    <!-- Session Cards -->
    <div v-else class="space-y-3">
      <Card v-for="session in sessions" :key="session.id">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <CardTitle class="text-base">{{ session.name }}</CardTitle>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ formatDateTime(session.startAt, '-') }} —
                {{ formatDateTime(session.endAt, '-') }}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-muted-foreground"
                    aria-label="打开场次操作菜单"
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
  <Dialog :open="showSessionDialog" @update:open="handleSessionOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-2xl sm:max-w-2xl"
      :show-close-button="!isSavingSession"
    >
      <DialogHeader>
        <DialogTitle>{{ editingSessionId ? '编辑场次' : '批量添加场次' }}</DialogTitle>
        <DialogDescription>场次名称必填，时间会用于前台购票和检票展示。</DialogDescription>
      </DialogHeader>

      <!-- Edit mode: single row form -->
      <div v-if="editingSessionId" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="session-name">场次名称 <span class="text-destructive">*</span></Label>
          <Input
            id="session-name"
            v-model="sessionForm.name"
            placeholder="请输入场次名称"
            :disabled="isSavingSession"
            :aria-invalid="Boolean(sessionError) || undefined"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>开始时间</Label>
            <DateTimePicker
              v-model="sessionForm.startAt"
              aria-label="选择场次开始时间"
              placeholder="选择开始时间"
              :disabled="isSavingSession"
            />
          </div>
          <div class="grid gap-2">
            <Label>结束时间</Label>
            <DateTimePicker
              v-model="sessionForm.endAt"
              aria-label="选择场次结束时间"
              placeholder="选择结束时间"
              :disabled="isSavingSession"
            />
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
            <Label v-if="idx === 0" :for="`batch-session-name-${idx}`"
              >场次名称 <span class="text-destructive">*</span></Label
            >
            <Input
              :id="`batch-session-name-${idx}`"
              v-model="row.name"
              :aria-label="`第 ${idx + 1} 行场次名称`"
              placeholder="请输入场次名称"
              :disabled="isSavingSession"
              :aria-invalid="Boolean(sessionError) || undefined"
            />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0" :for="`batch-session-start-${idx}`">开始时间</Label>
            <Input
              :id="`batch-session-start-${idx}`"
              v-model="row.startAt"
              type="datetime-local"
              :aria-label="`第 ${idx + 1} 行开始时间`"
              :disabled="isSavingSession"
            />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0" :for="`batch-session-end-${idx}`">结束时间</Label>
            <Input
              :id="`batch-session-end-${idx}`"
              v-model="row.endAt"
              type="datetime-local"
              :aria-label="`第 ${idx + 1} 行结束时间`"
              :disabled="isSavingSession"
            />
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="isSavingSession"
          @click="addBatchRow"
        >
          + 添加一行
        </Button>
        <FieldError v-if="sessionError">{{ sessionError }}</FieldError>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="isSavingSession"
          @click="handleSessionOpenChange(false)"
        >
          取消
        </Button>
        <Button type="button" :disabled="isSavingSession" @click="handleSaveSession">
          {{ isSavingSession ? '保存中...' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    :confirm-text="confirmDialog.confirmText"
    :confirm-variant="confirmDialog.confirmVariant"
    :loading="confirmDialog.isProcessing"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
