<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import { Calendar } from '@/components/common/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover'
import { Button } from '@/components/common/ui/button'

interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择日期和时间',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

const pad = (n: number | string) => String(n).padStart(2, '0')

const parse = (val?: string) => {
  if (!val) return { date: undefined as CalendarDate | undefined, hour: '00', minute: '00' }
  const [datePart = '', timePart = ''] = val.split('T')
  const parts = datePart.split('-').map(Number)
  const y = parts[0],
    m = parts[1],
    d = parts[2]
  const [h = '00', min = '00'] = timePart.split(':')
  if (!y || !m || !d)
    return { date: undefined as CalendarDate | undefined, hour: '00', minute: '00' }
  return {
    date: new CalendarDate(y, m, d),
    hour: pad(parseInt(h) || 0),
    minute: pad(parseInt(min) || 0),
  }
}

const calDate = shallowRef<CalendarDate | undefined>(parse(props.modelValue).date)
const hour = ref(parse(props.modelValue).hour)
const minute = ref(parse(props.modelValue).minute)

watch(
  () => props.modelValue,
  (val) => {
    const p = parse(val)
    calDate.value = p.date
    hour.value = p.hour
    minute.value = p.minute
  },
)

const buildValue = (d: CalendarDate, h: string, m: string) =>
  `${d.year}-${pad(d.month)}-${pad(d.day)}T${h}:${m}`

const calDateModel = computed<DateValue | undefined>(
  () => calDate.value as unknown as DateValue | undefined,
)

const displayText = computed(() => {
  if (!calDate.value) return ''
  return `${calDate.value.year}-${pad(calDate.value.month)}-${pad(calDate.value.day)} ${hour.value}:${minute.value}`
})

const onDateSelect = (val: DateValue | undefined) => {
  calDate.value = val as CalendarDate | undefined
  if (val) emit('update:modelValue', buildValue(val as CalendarDate, hour.value, minute.value))
}

const clampHour = (v: string) => pad(Math.max(0, Math.min(23, parseInt(v) || 0)))
const clampMinute = (v: string) => pad(Math.max(0, Math.min(59, parseInt(v) || 0)))

const onHourChange = () => {
  hour.value = clampHour(hour.value)
  if (calDate.value) emit('update:modelValue', buildValue(calDate.value, hour.value, minute.value))
}

const onMinuteChange = () => {
  minute.value = clampMinute(minute.value)
  if (calDate.value) emit('update:modelValue', buildValue(calDate.value, hour.value, minute.value))
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        :class="displayText ? 'text-foreground' : 'text-muted-foreground'"
      >
        <icon-lucide-calendar class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        {{ displayText || placeholder }}
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        :model-value="calDateModel"
        layout="month-and-year"
        locale="zh-CN"
        @update:model-value="onDateSelect"
      />
      <div class="flex items-center gap-2 border-t px-3 py-2">
        <icon-lucide-clock class="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          v-model="hour"
          type="number"
          min="0"
          max="23"
          class="w-16 rounded border border-input bg-background px-2 py-1 text-sm text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-ring"
          @change="onHourChange"
        />
        <span class="text-muted-foreground font-medium">:</span>
        <input
          v-model="minute"
          type="number"
          min="0"
          max="59"
          class="w-16 rounded border border-input bg-background px-2 py-1 text-sm text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-ring"
          @change="onMinuteChange"
        />
        <Button size="sm" class="ml-auto h-7 px-3" @click="open = false">确定</Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
