<script setup lang="ts">
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
import DateTimePicker from '@/components/common/DateTimePicker.vue'

const props = defineProps<{
  open: boolean
  editingSessionId: string | null
  sessionError: string
  sessionForm: { name: string; startAt?: string; endAt?: string }
  batchSessionRows: { name: string; startAt: string; endAt: string }[]
  isSaving: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:sessionForm': [form: { name: string; startAt?: string; endAt?: string }]
  'update:batchSessionRows': [rows: { name: string; startAt: string; endAt: string }[]]
  save: []
  'add-batch-row': []
  'remove-batch-row': [index: number]
}>()

const handleOpenChange = (value: boolean) => {
  if (!value && !props.isSaving) {
    emit('update:open', false)
  }
}

const updateSessionForm = (key: 'name' | 'startAt' | 'endAt', value: string | number) => {
  const val = String(value)
  if (key === 'name') {
    emit('update:sessionForm', { ...props.sessionForm, name: val })
  } else if (key === 'startAt') {
    emit('update:sessionForm', { ...props.sessionForm, startAt: val })
  } else {
    emit('update:sessionForm', { ...props.sessionForm, endAt: val })
  }
}

const updateBatchRow = (
  index: number,
  key: 'name' | 'startAt' | 'endAt',
  value: string | number,
) => {
  const val = String(value)
  const updated = [...props.batchSessionRows]
  const row = updated[index]
  if (!row) return
  updated[index] = {
    name: key === 'name' ? val : row.name,
    startAt: key === 'startAt' ? val : row.startAt,
    endAt: key === 'endAt' ? val : row.endAt,
  }
  emit('update:batchSessionRows', updated)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-2xl sm:max-w-2xl"
      :show-close-button="!isSaving"
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
            :model-value="sessionForm.name"
            @update:model-value="updateSessionForm('name', $event)"
            placeholder="请输入场次名称"
            :disabled="isSaving"
            :aria-invalid="Boolean(sessionError) || undefined"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>开始时间</Label>
            <DateTimePicker
              :model-value="sessionForm.startAt"
              @update:model-value="updateSessionForm('startAt', $event)"
              aria-label="选择场次开始时间"
              placeholder="选择开始时间"
              :disabled="isSaving"
            />
          </div>
          <div class="grid gap-2">
            <Label>结束时间</Label>
            <DateTimePicker
              :model-value="sessionForm.endAt"
              @update:model-value="updateSessionForm('endAt', $event)"
              aria-label="选择场次结束时间"
              placeholder="选择结束时间"
              :disabled="isSaving"
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
              :model-value="row.name"
              @update:model-value="updateBatchRow(idx, 'name', $event)"
              :aria-label="`第 ${idx + 1} 行场次名称`"
              placeholder="请输入场次名称"
              :disabled="isSaving"
              :aria-invalid="Boolean(sessionError) || undefined"
            />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0">开始时间</Label>
            <DateTimePicker
              :model-value="row.startAt"
              @update:model-value="updateBatchRow(idx, 'startAt', $event)"
              :aria-label="`第 ${idx + 1} 行开始时间`"
              placeholder="选择开始时间"
              :disabled="isSaving"
            />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0">结束时间</Label>
            <DateTimePicker
              :model-value="row.endAt"
              @update:model-value="updateBatchRow(idx, 'endAt', $event)"
              :aria-label="`第 ${idx + 1} 行结束时间`"
              placeholder="选择结束时间"
              :disabled="isSaving"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            class="text-destructive hover:text-destructive"
            :disabled="batchSessionRows.length <= 1"
            @click="emit('remove-batch-row', idx)"
          >
            删除
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="isSaving"
          @click="emit('add-batch-row')"
        >
          + 添加一行
        </Button>
        <FieldError v-if="sessionError">{{ sessionError }}</FieldError>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="handleOpenChange(false)"
        >
          取消
        </Button>
        <Button type="button" :disabled="isSaving" @click="emit('save')">
          {{ isSaving ? '保存中...' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
