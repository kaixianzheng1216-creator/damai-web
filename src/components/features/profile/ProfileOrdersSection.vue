<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { type ColumnDef } from '@tanstack/vue-table'
import type { OrderItem } from '@/api/account'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Badge } from '@/components/common/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { cn } from '@/utils'
import { ORDER_FILTER_OPTIONS, type OrderFilterKey } from '@/constants'
import { getOrderStatusBadgeClass } from '@/utils/statusMappers'

const router = useRouter()
const { viewMode } = useViewMode()

const handleOrderClick = (order: OrderItem) => {
  router.push(`/checkout/${order.id}`)
}

defineProps<{
  orderFilter: OrderFilterKey
  orderKeyword: string
  paginatedOrders: OrderItem[]
  orderPage: number
  orderTotalPages: number
  orderPageSize?: number
  orderTotalRow?: number
}>()

const emit = defineEmits<{
  'update:orderFilter': [value: OrderFilterKey]
  'update:orderKeyword': [value: string]
  'update:orderPage': [page: number]
  'update:orderPageSize': [pageSize: number]
}>()

const columns: ColumnDef<OrderItem>[] = [
  { accessorKey: 'title', header: '订单标题' },
  { accessorKey: 'orderNo', header: '订单号', size: 200 },
  {
    accessorKey: 'status',
    header: '状态',
    size: 120,
    cell: ({ row }) =>
      h(
        Badge,
        { class: getOrderStatusBadgeClass(row.original.status) },
        () => row.original.statusLabel,
      ),
  },
  { accessorKey: 'datetime', header: '场次', size: 180 },
  { accessorKey: 'amount', header: '金额', size: 120 },
]
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="paginatedOrders"
    :current-page="orderPage"
    :total-pages="orderTotalPages"
    :page-size="orderPageSize || 10"
    :total-row="orderTotalRow || 0"
    :show-create-button="false"
    :view-mode="viewMode"
    @update:current-page="emit('update:orderPage', $event)"
    @update:page-size="emit('update:orderPageSize', $event)"
    @row-click="handleOrderClick"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in ORDER_FILTER_OPTIONS"
            :key="item.key"
            type="button"
            :class="
              cn(
                'rounded-full px-3 py-1 text-sm',
                orderFilter === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80',
              )
            "
            @click="emit('update:orderFilter', item.key)"
          >
            {{ item.label }}
          </button>
        </div>
        <Input
          :model-value="orderKeyword"
          class="h-8 w-48"
          placeholder="搜索订单号或演出名称"
          @update:model-value="emit('update:orderKeyword', String($event))"
        />
      </div>
    </template>

    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <Card
          v-for="order in data"
          :key="order.id"
          class="cursor-pointer hover:border-primary/50 transition-colors"
          @click="handleOrderClick(order)"
        >
          <CardHeader class="pb-1.5">
            <div class="flex items-start justify-between gap-2">
              <CardTitle class="text-base leading-tight">{{ order.title }}</CardTitle>
              <Badge :class="getOrderStatusBadgeClass(order.status)">{{ order.statusLabel }}</Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-1 text-sm">
            <div class="flex items-center gap-2">
              <icon-lucide-file-text class="h-4 w-4 text-muted-foreground" />
              <span>订单号: {{ order.orderNo || order.id }}</span>
            </div>
            <div class="flex items-center gap-2">
              <icon-lucide-calendar class="h-4 w-4 text-muted-foreground" />
              <span>场次: {{ order.datetime }}</span>
            </div>
            <div class="flex items-center gap-2">
              <icon-lucide-credit-card class="h-4 w-4 text-muted-foreground" />
              <span class="font-semibold text-primary">{{ order.amount }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </DataTableCrud>
</template>
