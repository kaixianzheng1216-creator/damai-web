<script setup lang="ts" generic="TData">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import TablePagination from './TablePagination.vue'
import TableToolbar from './TableToolbar.vue'
import TableCardView from './TableCardView.vue'

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

    <!-- Table mode: render when columns are defined -->
    <template v-if="columns.length > 0">
      <div class="relative">
        <div
          v-if="loading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <icon-lucide-loader2 class="h-6 w-6 animate-spin text-primary" />
        </div>
        <div class="overflow-auto" :class="{ 'opacity-60': loading }">
          <table class="w-full border">
            <thead>
              <tr
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
                class="bg-muted"
              >
                <th
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="data.length">
                <tr
                  v-for="row in table.getRowModel().rows"
                  :key="row.id"
                  class="border-t hover:bg-muted/50 cursor-pointer"
                  @click="emit('row-click', row.original)"
                >
                  <td
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    class="px-4 py-3 text-sm"
                  >
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td :colspan="columns.length" class="px-4 py-16 text-center text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
  </div>
</template>
