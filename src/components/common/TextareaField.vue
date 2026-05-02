<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Label } from '@/components/common/ui/label'
import { Textarea } from '@/components/common/ui/textarea'
import { FieldDescription, FieldError } from '@/components/common/ui/field'
import { cn } from '@/utils'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    placeholder?: string
    description?: string
    error?: string
    required?: boolean
    disabled?: boolean
    rows?: number
    maxLength?: number
    class?: HTMLAttributes['class']
    textareaClass?: HTMLAttributes['class']
  }>(),
  {
    placeholder: '',
    description: '',
    error: '',
    rows: 3,
    maxLength: undefined,
    required: false,
    disabled: false,
    class: '',
    textareaClass: '',
  },
)

const emit = defineEmits<{
  keydown: [e: KeyboardEvent]
}>()

const descriptionId = computed(() => `${props.id}-description`)
const errorId = computed(() => `${props.id}-error`)
const describedBy = computed(() => {
  const ids = []
  if (props.description) ids.push(descriptionId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div :class="cn('space-y-2', props.class)">
    <Label :for="id">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </Label>
    <Textarea
      :id="id"
      v-model="model"
      :rows="rows"
      :maxlength="maxLength"
      :disabled="disabled"
      :placeholder="placeholder"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="describedBy"
      :class="cn('max-h-44 min-h-24 resize-none sm:max-h-60', textareaClass)"
      @keydown="emit('keydown', $event)"
    />
    <div class="flex items-start justify-between gap-3 text-xs">
      <div class="min-w-0">
        <FieldError v-if="error" :id="errorId" class="text-xs">
          {{ error }}
        </FieldError>
        <FieldDescription v-else-if="description" :id="descriptionId" class="text-xs">
          {{ description }}
        </FieldDescription>
      </div>
      <span v-if="maxLength" class="ml-auto shrink-0 text-muted-foreground">
        {{ model.length }}/{{ maxLength }}
      </span>
    </div>
  </div>
</template>
