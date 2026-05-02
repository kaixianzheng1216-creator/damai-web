<script setup lang="ts">
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
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

const handleFirstPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', 1)
  }
}

const handlePreviousPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const handleNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

const handleLastPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.totalPages)
  }
}
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
      <div class="flex w-fit items-center justify-center text-sm font-medium">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </div>
      <div class="ml-auto flex items-center gap-2 lg:ml-0">
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          :disabled="currentPage <= 1"
          @click="handleFirstPage"
        >
          <span class="sr-only">首页</span>
          <icon-lucide-chevrons-left class="size-4" />
        </Button>
        <Button
          variant="outline"
          class="size-8"
          size="icon"
          :disabled="currentPage <= 1"
          @click="handlePreviousPage"
        >
          <span class="sr-only">上一页</span>
          <icon-lucide-chevron-left class="size-4" />
        </Button>
        <Button
          variant="outline"
          class="size-8"
          size="icon"
          :disabled="currentPage >= totalPages"
          @click="handleNextPage"
        >
          <span class="sr-only">下一页</span>
          <icon-lucide-chevron-right class="size-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden size-8 lg:flex"
          size="icon"
          :disabled="currentPage >= totalPages"
          @click="handleLastPage"
        >
          <span class="sr-only">末页</span>
          <icon-lucide-chevrons-right class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
