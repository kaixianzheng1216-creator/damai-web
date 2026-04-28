<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <form
    class="mx-auto flex max-w-xl flex-1 items-center justify-center"
    @submit.prevent="handleSubmit"
  >
    <div class="relative w-full">
      <icon-lucide-search
        class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        :model-value="modelValue"
        type="search"
        placeholder="搜索"
        aria-label="搜索活动"
        class="h-9 w-full rounded-full border-transparent bg-muted/50 pl-9 pr-4 transition-all focus-visible:bg-background focus-visible:ring-primary md:h-10 md:pr-20"
        @update:model-value="emit('update:modelValue', String($event))"
      />
      <Button
        type="submit"
        class="absolute right-0 top-0 hidden h-10 rounded-l-none rounded-r-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 md:inline-flex"
        size="sm"
      >
        搜索
      </Button>
    </div>
  </form>
</template>
