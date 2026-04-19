<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover'
import { Separator } from '@/components/common/ui/separator'

defineProps<{
  open: boolean
  selectedCity: string
  hotCities: string[]
  otherCities: string[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [city: string]
}>()
</script>

<template>
  <Popover :open="open" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="mr-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-foreground transition-colors hover:bg-muted md:mr-4"
      >
        <icon-lucide-map-pin class="h-4 w-4 text-primary" />
        <span>{{ selectedCity }}</span>
        <icon-lucide-chevron-down class="h-4 w-4" />
      </button>
    </PopoverTrigger>

    <PopoverContent align="start" class="w-[calc(100vw-2rem)] p-4 md:w-[560px] md:p-6">
      <div class="space-y-6">
        <div class="flex min-h-9 items-center gap-5">
          <p class="w-20 text-sm leading-none text-foreground">当前城市:</p>
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-sm bg-primary/10 px-3 text-sm leading-none text-primary transition-colors hover:bg-primary/15"
            @click="emit('select', selectedCity)"
          >
            {{ selectedCity }}
          </button>
        </div>

        <div class="flex items-start gap-5">
          <p class="w-20 pt-1 text-sm text-foreground">热门城市:</p>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <button
              v-for="city in hotCities"
              :key="city"
              type="button"
              class="text-sm text-foreground transition-colors hover:text-primary"
              :class="city === selectedCity ? 'text-primary' : ''"
              @click="emit('select', city)"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <Separator />

        <div class="flex items-start gap-5">
          <p class="w-20 pt-1 text-sm text-foreground">其他城市:</p>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <button
              v-for="city in otherCities"
              :key="city"
              type="button"
              class="text-sm text-foreground transition-colors hover:text-primary"
              :class="city === selectedCity ? 'text-primary' : ''"
              @click="emit('select', city)"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
