<script setup lang="ts">
import type { SearchOption } from './types'

defineProps<{
  cityOptions: ReadonlyArray<SearchOption>
  parentCategoryOptions: ReadonlyArray<SearchOption>
  childCategoryOptions: ReadonlyArray<SearchOption>
  timeOptions: ReadonlyArray<SearchOption<number>>
  cityId: string | undefined
  categoryId: string | undefined
  selectedParentCategoryId: string | undefined
  timeType: number | undefined
}>()

defineEmits<{
  cityChange: [value: string | number | undefined]
  parentCategoryChange: [value: string | number | undefined]
  categoryChange: [value: string | number | undefined]
  timeSelect: [value: number]
}>()
</script>

<template>
  <div class="border border-border bg-background px-5">
    <SearchFilterGroup
      label="城市"
      :options="cityOptions"
      :active-value="cityId"
      @change="$emit('cityChange', $event)"
    />

    <SearchFilterGroup
      label="分类"
      :options="parentCategoryOptions"
      :active-value="selectedParentCategoryId"
      @change="$emit('parentCategoryChange', $event)"
    />

    <SearchFilterGroup
      v-if="selectedParentCategoryId"
      label="子分类"
      :options="childCategoryOptions"
      :active-value="categoryId"
      @change="$emit('categoryChange', $event)"
    />

    <div class="flex flex-wrap items-start gap-4 py-4">
      <p class="w-12 shrink-0 pt-1 text-sm text-muted-foreground">时间</p>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="item in timeOptions"
          :key="item.value"
          type="button"
          :class="
            cn(
              'rounded-sm px-3 py-1.5 text-sm transition-colors',
              item.value === timeType
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted',
            )
          "
          @click="$emit('timeSelect', item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>
