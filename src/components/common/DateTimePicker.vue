<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import dayjs from 'dayjs'
import { Calendar } from '@/components/common/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover'
import { Button } from '@/components/common/ui/button'
import { NumberField, NumberFieldInput } from '@/components/common/ui/number-field'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '选择日期和时间',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

const parse = (val?: string) => {
  if (!val) return { date: undefined as CalendarDate | undefined, hour: '00', minute: '00' }
  const d = dayjs(val, 'YYYY-MM-DDTHH:mm')
  if (!d.isValid()) return { date: undefined as CalendarDate | undefined, hour: '00', minute: '00' }
  return {
    date: new CalendarDate(d.year(), d.month() + 1, d.date()),
    hour: d.format('HH'),
    minute: d.format('mm'),
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
  dayjs(`${d.year}-${d.month}-${d.day} ${h}:${m}`).format('YYYY-MM-DDTHH:mm')

const calDateModel = computed<DateValue | undefined>(
  () => calDate.value as unknown as DateValue | undefined,
)

const displayText = computed(() => {
  if (!calDate.value) return ''
  return dayjs(
    `${calDate.value.year}-${calDate.value.month}-${calDate.value.day} ${hour.value}:${minute.value}`,
  ).format('YYYY-MM-DD HH:mm')
})
const triggerAriaLabel = computed(() => props.ariaLabel ?? props.placeholder)

const onDateSelect = (val: DateValue | undefined) => {
  calDate.value = val as CalendarDate | undefined
  if (val) emit('update:modelValue', buildValue(val as CalendarDate, hour.value, minute.value))
}

const clampHour = (v: string) =>
  dayjs()
    .hour(parseInt(v) || 0)
    .format('HH')
const clampMinute = (v: string) =>
  dayjs()
    .minute(parseInt(v) || 0)
    .format('mm')

const onHourChange = () => {
  hour.value = clampHour(hour.value)
  if (calDate.value) emit('update:modelValue', buildValue(calDate.value, hour.value, minute.value))
}

const onMinuteChange = () => {
  minute.value = clampMinute(minute.value)
  if (calDate.value) emit('update:modelValue', buildValue(calDate.value, hour.value, minute.value))
}

const handleOpenChange = (value: boolean) => {
  open.value = props.disabled ? false : value
}
</script>

<template>
  <Popover :open="open" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        class="w-full justify-start font-normal"
        :class="displayText ? 'text-foreground' : 'text-muted-foreground'"
        :aria-label="triggerAriaLabel"
        :disabled="disabled"
      >
        <icon-lucide-calendar class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        {{ displayText || placeholder }}
      </Button>
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
        <NumberField
          :model-value="hour ? Number(hour) : undefined"
          :min="0"
          :max="23"
          :disabled="disabled"
          class="w-16"
          @update:model-value="
            (v: string | number | undefined) => {
              hour = String(v ?? 0).padStart(2, '0')
              onHourChange()
            }
          "
        >
          <NumberFieldInput aria-label="小时" class="text-center" />
        </NumberField>
        <span class="text-muted-foreground font-medium">:</span>
        <NumberField
          :model-value="minute ? Number(minute) : undefined"
          :min="0"
          :max="59"
          :disabled="disabled"
          class="w-16"
          @update:model-value="
            (v: string | number | undefined) => {
              minute = String(v ?? 0).padStart(2, '0')
              onMinuteChange()
            }
          "
        >
          <NumberFieldInput aria-label="分钟" class="text-center" />
        </NumberField>
        <Button size="sm" class="ml-auto h-7 px-3" :disabled="disabled" @click="open = false">
          确定
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
