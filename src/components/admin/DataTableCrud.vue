<script setup lang="ts" generic="TData">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
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
    virtualScroll?: boolean
    virtualScrollHeight?: string
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
    virtualScroll: false,
    virtualScrollHeight: '600px',
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

// Virtual scrolling setup
const scrollContainerRef = ref<HTMLDivElement | null>(null)

const allRows = computed(() => table.getRowModel().rows)

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: allRows.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => 48,
    overscan: 5,
  })),
)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalHeight = computed(() => rowVirtualizer.value.getTotalSize())
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

        <!-- Virtual scrolling mode -->
        <template v-if="virtualScroll">
          <div class="overflow-x-auto">
            <table
              class="w-full caption-bottom text-sm border table-fixed border-b-0 rounded-t-md"
              :class="{ 'opacity-60': loading }"
            >
              <colgroup>
                <col
                  v-for="header in table.getHeaderGroups()[0]?.headers ?? []"
                  :key="header.id"
                  :style="{
                    width: header.column.getSize() + 'px',
                    minWidth: header.column.getSize() + 'px',
                  }"
                />
              </colgroup>
              <thead data-slot="table-header" class="[&_tr]:border-b">
                <TableRow
                  v-for="headerGroup in table.getHeaderGroups()"
                  :key="headerGroup.id"
                  class="bg-muted"
                >
                  <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                    class="truncate !px-4 !py-3"
                  >
                    <FlexRender
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </TableHead>
                </TableRow>
              </thead>
            </table>
            <div
              ref="scrollContainerRef"
              class="overflow-y-auto border-x border-b rounded-b-md"
              :style="{ maxHeight: virtualScrollHeight }"
            >
              <div
                :style="{
                  height: `${totalHeight}px`,
                  position: 'relative',
                  width: '100%',
                }"
              >
                <div
                  v-for="virtualRow in virtualRows"
                  :key="String(virtualRow.key)"
                  :ref="(el) => rowVirtualizer.measureElement(el as HTMLElement)"
                  :data-index="virtualRow.index"
                  :style="{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }"
                  class="flex hover:bg-muted/50 cursor-pointer border-b transition-colors"
                  @click="
                    allRows[virtualRow.index] &&
                    emit('row-click', allRows[virtualRow.index]!.original)
                  "
                >
                  <div
                    v-for="cell in allRows[virtualRow.index]?.getVisibleCells() ?? []"
                    :key="cell.id"
                    :style="{
                      width: cell.column.getSize() + 'px',
                      minWidth: cell.column.getSize() + 'px',
                    }"
                    class="truncate flex items-center px-4 py-3"
                  >
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </div>
                </div>
              </div>
              <div v-if="!data.length" class="px-4 py-16 text-center text-muted-foreground">
                暂无数据
              </div>
            </div>
          </div>
        </template>

        <!-- Non-virtualized table (original behavior) -->
        <Table v-else class="border table-fixed" :class="{ 'opacity-60': loading }">
          <colgroup>
            <col
              v-for="header in table.getHeaderGroups()[0]?.headers ?? []"
              :key="header.id"
              :style="{
                width: header.column.getSize() + 'px',
                minWidth: header.column.getSize() + 'px',
              }"
            />
          </colgroup>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="bg-muted"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="truncate !px-4 !py-3"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              </TableHead>
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
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="truncate !px-4 !py-3"
                >
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell
                :colspan="columns.length"
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
