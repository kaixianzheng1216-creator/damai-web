<script setup lang="ts">
import type { WorkOrderVO } from '@/api/trade'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import CardListItem from '@/components/common/CardListItem.vue'
import { WORK_ORDER_FILTER_OPTIONS, type WorkOrderFilterKey } from '@/constants'
import { cn } from '@/utils'
import { formatDateTime } from '@/utils/format'

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
</script>

<template>
  <DataTableCrud
    :data="workOrders"
    :current-page="workOrderPage"
    :total-pages="workOrderTotalPages"
    :page-size="workOrderPageSize || 10"
    :total-row="workOrderTotalRow || 0"
    :show-create-button="false"
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
        <CardListItem
          v-for="workOrder in data"
          :key="workOrder.id"
          @click="emit('open-detail', workOrder)"
        >
          <template #title>
            <p class="line-clamp-2 text-sm font-bold text-foreground">{{ workOrder.title }}</p>
          </template>
          <template #details>
            <p class="flex items-center gap-1 text-xs text-muted-foreground">
              <icon-lucide-tags class="h-3 w-3 shrink-0" />{{ workOrder.typeLabel || '其他' }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ formatDateTime(workOrder.lastReplyAt || workOrder.createAt, '-') }}
            </p>
          </template>
          <template #middle>
            <hr class="border-border" />
          </template>
          <template #bottomLeft>
            <p class="text-xs text-muted-foreground">{{ workOrder.workOrderNo || workOrder.id }}</p>
          </template>
          <template #bottomRight>
            <span
              class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >{{ workOrder.statusLabel }}</span
            >
          </template>
        </CardListItem>
      </div>
    </template>
  </DataTableCrud>
</template>
