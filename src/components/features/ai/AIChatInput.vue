<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { AI_CHAT_COPY } from '@/constants'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'

defineProps<{
  isPending: boolean
}>()

const value = defineModel<string>({ required: true })

const emit = defineEmits<{
  submit: [text: string]
}>()

const inputRef = ref<InstanceType<typeof Input>>()

const focus = async () => {
  await nextTick()
  const el = inputRef.value?.$el as HTMLInputElement | undefined
  el?.focus()
}

const handleSubmit = () => {
  const trimmed = value.value.trim()
  if (!trimmed) {
    return
  }

  emit('submit', trimmed)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

defineExpose({ focus })

void focus()
</script>

<template>
  <div class="border-t border-border bg-background shadow-sm">
    <div class="mx-auto w-full max-w-[800px] px-4 py-4 pb-6 md:pb-8">
      <div class="flex items-center gap-2">
        <Input
          ref="inputRef"
          v-model="value"
          :placeholder="AI_CHAT_COPY.inputPlaceholder"
          class="flex-1 rounded-full border-0 bg-muted px-4 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0"
          @keydown="handleKeydown"
        />
        <Button
          size="icon"
          :disabled="!value.trim() || isPending"
          class="shrink-0 rounded-full"
          @click="handleSubmit"
        >
          <icon-lucide-send class="h-4 w-4" />
          <span class="sr-only">{{ AI_CHAT_COPY.send }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>
