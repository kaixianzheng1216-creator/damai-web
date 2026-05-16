<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { OrderItem } from '@/api/account'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import OrderCard from '@/components/common/OrderCard.vue'
import { Button } from '@/components/common/ui/button'
import { ORDER_FILTER_OPTIONS, type OrderFilterKey } from '@/constants'

const router = useRouter()
const handleOrderClick = (order: OrderItem) => {
  router.push(`/checkout/${order.id}`)
}

defineProps<{
  orderFilter: OrderFilterKey
  paginatedOrders: OrderItem[]
  orderPage: number
  orderTotalPages: number
  orderPageSize?: number
  orderTotalRow?: number
}>()

const emit = defineEmits<{
  'update:orderFilter': [value: OrderFilterKey]
  'update:orderPage': [page: number]
  'update:orderPageSize': [pageSize: number]
}>()
</script>

<template>
  <DataTableCrud
    :data="paginatedOrders"
    :current-page="orderPage"
    :total-pages="orderTotalPages"
    :page-size="orderPageSize || 10"
    :total-row="orderTotalRow || 0"
    :show-create-button="false"
    @update:current-page="emit('update:orderPage', $event)"
    @update:page-size="emit('update:orderPageSize', $event)"
    @row-click="handleOrderClick"
  >
    <template #toolbar>
      <div
        class="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0"
      >
        <div class="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <Button
            v-for="item in ORDER_FILTER_OPTIONS"
            :key="item.key"
            type="button"
            size="sm"
            :variant="orderFilter === item.key ? undefined : 'ghost'"
            class="rounded-full"
            @click="emit('update:orderFilter', item.key)"
          >
            {{ item.label }}
          </Button>
        </div>
      </div>
    </template>

    <template #cardTemplate="{ data }">
      <div class="space-y-3 sm:space-y-4">
        <OrderCard
          v-for="order in data"
          :key="order.id"
          :id="order.id"
          :event-name-snapshot="order.title"
          :event-cover-url-snapshot="order.eventCoverUrlSnapshot"
          :venue-name-snapshot="order.venueNameSnapshot"
          :session-start-at-snapshot="order.sessionStartAtSnapshot"
          :total-amount="order.totalAmount"
          :quantity="order.quantity"
          :amount="order.amount"
          :status-label="order.statusLabel"
          :order-no="order.orderNo || order.id"
        />
      </div>
    </template>
  </DataTableCrud>
</template>
