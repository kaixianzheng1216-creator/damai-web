<script setup lang="ts">
import type { WorkOrderVO } from '@/api/trade'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import CardListItem from '@/components/common/CardListItem.vue'
import { Button } from '@/components/common/ui/button'
import { WORK_ORDER_FILTER_OPTIONS, type WorkOrderFilterKey } from '@/constants'
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
      <div
        class="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0"
      >
        <div class="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <Button
            v-for="item in WORK_ORDER_FILTER_OPTIONS"
            :key="item.key"
            type="button"
            size="sm"
            :variant="workOrderFilter === item.key ? undefined : 'ghost'"
            class="rounded-full"
            @click="emit('update:workOrderFilter', item.key)"
          >
            {{ item.label }}
          </Button>
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
            <p class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <icon-lucide-tags class="h-3 w-3 shrink-0" />
              <span class="truncate">{{ workOrder.typeLabel || '其他' }}</span>
            </p>
            <p class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <icon-lucide-clock class="h-3 w-3 shrink-0" />
              <span class="truncate">{{ formatDateTime(workOrder.createAt, '-') }}</span>
            </p>
          </template>
          <template #middle>
            <hr class="border-border" />
          </template>
          <template #topRight>
            <Badge variant="secondary">{{ workOrder.statusLabel }}</Badge>
          </template>
          <template #bottomLeft>
            <p class="truncate text-xs text-muted-foreground">
              {{ workOrder.workOrderNo || workOrder.id }}
            </p>
          </template>
        </CardListItem>
      </div>
    </template>
  </DataTableCrud>
</template>
