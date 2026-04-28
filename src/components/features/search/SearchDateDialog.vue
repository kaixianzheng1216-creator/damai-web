<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import { Button } from '@/components/common/ui/button'
import { Calendar } from '@/components/common/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'

defineProps<{
  open: boolean
  dateModel: DateValue | undefined
}>()

defineEmits<{
  'update:open': [value: boolean]
  'update:date': [value: CalendarDate]
  confirm: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[360px]">
      <DialogHeader>
        <DialogTitle>选择日期</DialogTitle>
      </DialogHeader>
      <div class="py-2">
        <Calendar
          :model-value="dateModel"
          layout="month-and-year"
          locale="zh-CN"
          @update:model-value="$emit('update:date', $event as CalendarDate)"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">取消</Button>
        <Button :disabled="!dateModel" @click="$emit('confirm')">确认</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
