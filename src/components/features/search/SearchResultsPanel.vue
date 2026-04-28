<script setup lang="ts">
import type { EventVO } from '@/api/event'
import { Button } from '@/components/common/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/common/ui/pagination'
import SearchResultListItem from './SearchResultListItem.vue'
import type { SearchOption } from './types'

defineProps<{
  records: ReadonlyArray<EventVO>
  total: number
  page: number
  size: number
  sortType: number | undefined
  sortOptions: ReadonlyArray<SearchOption<number>>
  isLoading: boolean
  isError: boolean
}>()

defineEmits<{
  sortChange: [value: number]
  pageChange: [value: number]
}>()
</script>

<template>
  <div class="mt-4 border border-border bg-background">
    <div
      class="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-2"
    >
      <div class="flex items-center">
        <button
          v-for="item in sortOptions"
          :key="item.value"
          type="button"
          :class="
            cn(
              'border-r border-border px-5 py-2 text-sm last:border-r-0',
              item.value === sortType ? 'text-primary' : 'text-foreground',
            )
          "
          @click="$emit('sortChange', item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex min-h-[420px] flex-center">
      <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div v-else-if="isError" class="flex min-h-[420px] flex-center text-destructive">
      加载失败，请稍后重试
    </div>

    <div v-else-if="!records.length" class="flex min-h-[420px] flex-center text-muted-foreground">
      没有找到符合条件的演出
    </div>

    <div v-else class="px-4">
      <SearchResultListItem v-for="item in records" :key="item.id" :item="item" />
    </div>

    <Pagination
      v-slot="{ page: scopedPage }"
      class="justify-end border-t border-border py-5"
      :total="total"
      :items-per-page="size"
      :sibling-count="1"
      :default-page="page"
      :page="page"
      @update:page="$emit('pageChange', $event)"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />
        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" as-child>
            <Button :variant="item.value === scopedPage ? 'default' : 'outline'" size="sm">
              {{ item.value }}
            </Button>
          </PaginationItem>
          <PaginationEllipsis v-else :index="index" />
        </template>
        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>
