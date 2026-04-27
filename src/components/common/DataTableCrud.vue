<script setup lang="ts">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'
import type { ViewMode } from '@/composables/useViewMode'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table'
import { Card, CardContent } from '@/components/common/ui/card'

interface Props<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  loading?: boolean
  title?: string
  currentPage?: number
  totalPages?: number
  pageSizeOptions?: number[]
  pageSize?: number
  totalRow?: number
  showCreateButton?: boolean
  viewMode?: ViewMode
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props<any>>(), {
  pageSizeOptions: () => [10, 20, 30, 40, 50],
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
  totalRow: 0,
  showCreateButton: true,
  viewMode: 'table',
  showPagination: true,
})

const emit = defineEmits<{
  create: []
  edit: [row: any]
  delete: [row: any]
  'update:currentPage': [page: number]
  'update:pageSize': [pageSize: number]
  'row-click': [row: any]
}>()

const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  manualPagination: true,
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  state: {
    get pagination() {
      return { pageIndex: props.currentPage - 1, pageSize: props.pageSize }
    },
    get sorting() {
      return sorting.value
    },
  },
})

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
  <div class="space-y-6 w-full min-w-0">
    <div class="flex flex-wrap items-center gap-4 min-w-0">
      <h2 v-if="title" class="shrink-0 text-lg font-semibold text-foreground">
        {{ title }}
      </h2>
      <slot name="toolbar" />
      <div class="hidden sm:block flex-1" />
      <div class="ml-auto shrink-0">
        <slot name="actions">
          <Button v-if="showCreateButton" size="sm" @click="emit('create')">
            <icon-lucide-plus class="mr-1.5 h-4 w-4" />
            新建
          </Button>
        </slot>
      </div>
    </div>

    <div
      v-if="viewMode === 'table'"
      class="relative rounded-lg border border-border bg-card overflow-x-auto w-full"
    >
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex-center bg-background/60 backdrop-blur-sm"
      >
        <icon-lucide-loader2 class="h-6 w-6 animate-spin text-primary" />
      </div>

      <Table>
        <TableHeader class="bg-muted sticky top-0 z-10">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :col-span="header.colSpan"
            >
              <div
                v-if="!header.isPlaceholder && header.column.getCanSort()"
                class="flex items-center cursor-pointer select-none"
                @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <icon-lucide-chevron-down
                  class="ml-2 h-4 w-4"
                  :class="{
                    'opacity-0': !header.column.getIsSorted(),
                    'rotate-180': header.column.getIsSorted() === 'asc',
                  }"
                />
              </div>
              <FlexRender
                v-else-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="cursor-pointer hover:bg-muted/50 transition-colors"
              @click="emit('row-click', row.original)"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else-if="!loading">
            <TableCell :colspan="table.getAllColumns().length" class="py-16 text-center">
              <div class="flex flex-col items-center gap-2">
                <icon-lucide-inbox class="h-10 w-10 opacity-30" />
                <span class="text-muted-sm">暂无数据</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div v-else-if="viewMode === 'card'" class="relative space-y-4">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex-center bg-background/60 backdrop-blur-sm"
      >
        <icon-lucide-loader2 class="h-6 w-6 animate-spin text-primary" />
      </div>

      <template v-if="data.length && !loading">
        <slot name="cardTemplate" :data="data" :rows="table.getRowModel().rows">
          <div class="space-y-4">
            <Card v-for="row in table.getRowModel().rows" :key="row.id">
              <CardContent class="pt-6">
                <div class="space-y-2">
                  <div
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    class="flex items-center gap-2"
                  >
                    <span class="text-muted-foreground text-sm">
                      <FlexRender
                        :render="cell.column.columnDef.header"
                        :props="cell.getContext()"
                      />:
                    </span>
                    <span class="text-sm">
                      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </slot>
      </template>
      <div v-else-if="!loading" class="flex min-h-80 flex-center">
        <div class="text-center text-muted-foreground">
          <icon-lucide-inbox class="mx-auto h-12 w-12 mb-2" />
          <p>暂无数据</p>
        </div>
      </div>
    </div>

    <div v-if="showPagination" class="flex items-center justify-between">
      <div class="text-muted-foreground hidden flex-1 text-sm lg:flex">
        共 {{ totalRow }} 条记录
      </div>
      <div class="flex w-full items-center gap-8 lg:w-fit">
        <div class="hidden items-center gap-2 lg:flex">
          <Label for="rows-per-page" class="text-sm font-medium"> 每页行数 </Label>
          <Select
            :model-value="String(pageSize)"
            @update:model-value="
              (value) => {
                emit('update:pageSize', Number(value))
              }
            "
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
  </div>
</template>
