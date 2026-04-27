<script setup lang="ts">
import { h } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import type { WorkOrderVO } from '@/api/trade'
import DataTableCrud from '@/components/common/CommonDataTableCrud.vue'
import { Badge } from '@/components/common/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { WORK_ORDER_FILTER_OPTIONS, type WorkOrderFilterKey } from '@/constants'
import { cn } from '@/utils'
import { formatDateTime } from '@/utils/format'
import { getWorkOrderStatusBadgeClass } from '@/utils/statusMappers'

const { viewMode } = useViewMode()

defineProps<{
  workOrderFilter: WorkOrderFilterKey
  workOrders: WorkOrderVO[]
  workOrderPage: number
  workOrderPageSize?: number
  workOrderTotalPages: number
  workOrderTotalRow?: number
}>()

const emit = defineEmits<{
  'update:workOrderFilter': [value: WorkOrderFilterKey]
  'update:workOrderPage': [page: number]
  'update:workOrderPageSize': [pageSize: number]
  'open-detail': [workOrder: WorkOrderVO]
}>()

const columns: ColumnDef<WorkOrderVO>[] = [
  { accessorKey: 'title', header: '工单标题' },
  { accessorKey: 'workOrderNo', header: '工单号', size: 180 },
  { accessorKey: 'typeLabel', header: '类型', size: 120 },
  {
    accessorKey: 'status',
    header: '状态',
    size: 120,
    cell: ({ row }) =>
      h(
        Badge,
        { class: getWorkOrderStatusBadgeClass(row.original.status) },
        () => row.original.statusLabel,
      ),
  },
  {
    accessorKey: 'lastReplyAt',
    header: '最后回复',
    size: 160,
    cell: ({ row }) => formatDateTime(row.original.lastReplyAt, '-'),
  },
]
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="workOrders"
    :current-page="workOrderPage"
    :total-pages="workOrderTotalPages"
    :page-size="workOrderPageSize || 10"
    :total-row="workOrderTotalRow || 0"
    :show-create-button="false"
    :view-mode="viewMode"
    @update:current-page="emit('update:workOrderPage', $event)"
    @update:page-size="emit('update:workOrderPageSize', $event)"
    @row-click="emit('open-detail', $event)"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            v-for="item in WORK_ORDER_FILTER_OPTIONS"
            :key="item.key"
            :class="
              cn(
                'rounded-full px-3 py-1 text-sm',
                workOrderFilter === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80',
              )
            "
            @click="emit('update:workOrderFilter', item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </template>

    <template #cardTemplate="{ data }">
      <div class="space-y-3">
        <Card
          v-for="workOrder in data"
          :key="workOrder.id"
          class="cursor-pointer transition-colors hover:border-primary/50"
          @click="emit('open-detail', workOrder)"
        >
          <CardHeader class="pb-2">
            <div class="flex items-start justify-between gap-2">
              <CardTitle class="min-w-0 text-base leading-tight">
                <span class="line-clamp-2">{{ workOrder.title }}</span>
              </CardTitle>
              <Badge :class="getWorkOrderStatusBadgeClass(workOrder.status)">
                {{ workOrder.statusLabel }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-muted-foreground">
              <icon-lucide-hash class="size-4 shrink-0" />
              <span class="truncate">{{ workOrder.workOrderNo || workOrder.id }}</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <icon-lucide-tags class="size-4 shrink-0" />
              <span>{{ workOrder.typeLabel || '其他' }}</span>
            </div>
            <p class="line-clamp-2 text-muted-foreground">
              {{ workOrder.lastReplyPreview || workOrder.content || '暂无回复' }}
            </p>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <icon-lucide-clock class="size-3.5 shrink-0" />
              <span>{{ formatDateTime(workOrder.lastReplyAt || workOrder.createAt, '-') }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </DataTableCrud>
</template>
