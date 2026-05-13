<script setup lang="ts" generic="TData">
import {
  type Column,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import type { CSSProperties } from 'vue'
import TablePagination from './TablePagination.vue'
import TableToolbar from './TableToolbar.vue'
import TableCardView from './TableCardView.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

const props = withDefaults(
  defineProps<{
    data: TData[]
    columns?: ColumnDef<TData>[]
    loading?: boolean
    title?: string
    currentPage?: number
    totalPages?: number
    pageSizeOptions?: number[]
    pageSize?: number
    totalRow?: number
    showCreateButton?: boolean
    showPagination?: boolean
    confirmDialog?: ConfirmDialogState
  }>(),
  {
    pageSizeOptions: () => [10, 20, 30, 40, 50],
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    totalRow: 0,
    showCreateButton: true,
    showPagination: true,
    columns: () => [],
    confirmDialog: undefined,
  },
)

const emit = defineEmits<{
  create: []
  edit: [row: TData]
  delete: [row: TData]
  'update:currentPage': [page: number]
  'update:pageSize': [pageSize: number]
  'row-click': [row: TData]
  closeConfirm: []
  confirm: []
}>()

const sorting = ref<SortingState>([])
const ACTIONS_COLUMN_ID = 'actions'

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

const shouldRenderWidthFiller = computed(() => props.columns.length > 0)
const hasActionsColumn = computed(() =>
  table.getAllLeafColumns().some((column) => column.id === ACTIONS_COLUMN_ID),
)
const shouldRenderTrailingFiller = computed(
  () => shouldRenderWidthFiller.value && !hasActionsColumn.value,
)

const shouldRenderFillerBeforeColumn = (column: Column<TData, unknown>) =>
  shouldRenderWidthFiller.value && column.id === ACTIONS_COLUMN_ID

const getColumnStyle = (column: Column<TData, unknown>): CSSProperties => {
  const width = `${column.getSize()}px`

  return {
    width,
    minWidth: width,
    maxWidth: width,
  }
}
</script>

<template>
  <div class="space-y-6 w-full min-w-0">
    <TableToolbar :title="title" :show-create-button="showCreateButton" @create="emit('create')">
      <template #toolbar><slot name="toolbar" /></template>
      <template #actions><slot name="actions" /></template>
    </TableToolbar>

    <!-- Table mode: render when columns are defined -->
    <template v-if="columns.length > 0">
      <div class="relative">
        <div
          v-if="loading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <icon-lucide-loader2 class="h-6 w-6 animate-spin text-primary" />
        </div>

        <Table class="border table-fixed" :class="{ 'opacity-60': loading }">
          <colgroup>
            <template v-for="header in table.getHeaderGroups()[0]?.headers ?? []" :key="header.id">
              <col v-if="shouldRenderFillerBeforeColumn(header.column)" />
              <col :style="getColumnStyle(header.column)" />
            </template>
            <col v-if="shouldRenderTrailingFiller" />
          </colgroup>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="bg-muted"
            >
              <template v-for="header in headerGroup.headers" :key="header.id">
                <TableHead
                  v-if="shouldRenderFillerBeforeColumn(header.column)"
                  aria-hidden="true"
                  class="!px-0 !py-3"
                />
                <TableHead class="truncate !px-4 !py-3" :style="getColumnStyle(header.column)">
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </TableHead>
              </template>
              <TableHead v-if="shouldRenderTrailingFiller" aria-hidden="true" class="!px-0 !py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="data.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                class="border-t hover:bg-muted/50 cursor-pointer"
                @click="emit('row-click', row.original)"
              >
                <template v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <TableCell
                    v-if="shouldRenderFillerBeforeColumn(cell.column)"
                    aria-hidden="true"
                    class="!px-0 !py-3"
                  />
                  <TableCell class="truncate !px-4 !py-3" :style="getColumnStyle(cell.column)">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </TableCell>
                </template>
                <TableCell
                  v-if="shouldRenderTrailingFiller"
                  aria-hidden="true"
                  class="!px-0 !py-3"
                />
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell
                :colspan="columns.length + (shouldRenderWidthFiller ? 1 : 0)"
                class="!px-4 !py-16 text-center text-muted-foreground"
              >
                暂无数据
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>

    <!-- Card mode: render when no columns (profile sections with cardTemplate) -->
    <TableCardView
      v-else
      :loading="loading"
      :data="data"
      :rows="table.getRowModel().rows"
      @row-click="emit('row-click', $event)"
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

    <ConfirmDialog
      :open="confirmDialog?.open ?? false"
      :title="confirmDialog?.title ?? ''"
      :description="confirmDialog?.description ?? ''"
      :confirm-text="confirmDialog?.confirmText ?? '确认'"
      :confirm-variant="confirmDialog?.confirmVariant ?? 'default'"
      :loading="confirmDialog?.isProcessing ?? false"
      @close="emit('closeConfirm')"
      @confirm="emit('confirm')"
    />
  </div>
</template>
