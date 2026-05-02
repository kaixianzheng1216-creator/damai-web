<script setup lang="ts" generic="TData">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'
import type { ViewMode } from '@/composables/useViewMode'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table'
import EmptyState from '@/components/common/EmptyState.vue'
import TablePagination from '@/components/admin/TablePagination.vue'
import TableToolbar from '@/components/admin/TableToolbar.vue'
import TableCardView from '@/components/admin/TableCardView.vue'

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    pageSizeOptions: () => [10, 20, 30, 40, 50],
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    totalRow: 0,
    showCreateButton: true,
    viewMode: 'table',
    showPagination: true,
  },
)

const emit = defineEmits<{
  create: []
  edit: [row: TData]
  delete: [row: TData]
  'update:currentPage': [page: number]
  'update:pageSize': [pageSize: number]
  'row-click': [row: TData]
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
</script>

<template>
  <div class="space-y-6 w-full min-w-0">
    <TableToolbar :title="title" :show-create-button="showCreateButton" @create="emit('create')">
      <template #toolbar><slot name="toolbar" /></template>
      <template #actions><slot name="actions" /></template>
    </TableToolbar>

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
              <EmptyState class="min-h-36 py-0" title="暂无数据" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <TableCardView
      v-else-if="viewMode === 'card'"
      :loading="loading"
      :data="data"
      :rows="table.getRowModel().rows"
    >
      <template #cardTemplate="{ data: slotData, rows: slotRows }">
        <slot name="cardTemplate" :data="slotData" :rows="slotRows" />
      </template>
    </TableCardView>

    <TablePagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :total-row="totalRow"
      :show-pagination="showPagination"
      @update:current-page="emit('update:currentPage', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>
