<script setup lang="ts">
import {
  Pagination,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/common/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'

interface Props {
  currentPage?: number
  totalPages?: number
  pageSize?: number
  pageSizeOptions?: number[]
  totalRow?: number
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 30, 40, 50],
  totalRow: 0,
  showPagination: true,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const totalCount = computed(() => props.totalPages * props.pageSize)
</script>

<template>
  <div v-if="showPagination" class="flex items-center justify-between">
    <div class="text-muted-foreground hidden flex-1 text-sm lg:flex">共 {{ totalRow }} 条记录</div>
    <div class="flex w-full items-center gap-8 lg:w-fit">
      <div class="hidden items-center gap-2 lg:flex">
        <Label for="rows-per-page" class="text-sm font-medium"> 每页行数 </Label>
        <Select
          :model-value="String(pageSize)"
          @update:model-value="(value) => emit('update:pageSize', Number(value))"
        >
          <SelectTrigger id="rows-per-page" size="sm" class="w-20">
            <SelectValue :placeholder="`${pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="ps in pageSizeOptions" :key="ps" :value="`${ps}`">
              {{ ps }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Pagination
        :total="totalCount"
        :items-per-page="pageSize"
        :page="currentPage"
        :sibling-count="0"
        class="mx-0 w-fit"
        @update:page="emit('update:currentPage', $event)"
      >
        <div class="flex w-fit items-center justify-center gap-2 text-sm font-medium">
          <PaginationFirst
            size="icon"
            class="hidden h-8 w-8 lg:flex"
            @click="emit('update:currentPage', 1)"
          >
            <span class="sr-only">首页</span>
            <icon-lucide-chevrons-left class="size-4" />
          </PaginationFirst>
          <PaginationPrevious
            size="icon"
            class="size-8"
            @click="emit('update:currentPage', currentPage - 1)"
          >
            <span class="sr-only">上一页</span>
            <icon-lucide-chevron-left class="size-4" />
          </PaginationPrevious>
          <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <PaginationNext
            size="icon"
            class="size-8"
            @click="emit('update:currentPage', currentPage + 1)"
          >
            <span class="sr-only">下一页</span>
            <icon-lucide-chevron-right class="size-4" />
          </PaginationNext>
          <PaginationLast
            size="icon"
            class="hidden size-8 lg:flex"
            @click="emit('update:currentPage', totalPages)"
          >
            <span class="sr-only">末页</span>
            <icon-lucide-chevrons-right class="size-4" />
          </PaginationLast>
        </div>
      </Pagination>
    </div>
  </div>
</template>
