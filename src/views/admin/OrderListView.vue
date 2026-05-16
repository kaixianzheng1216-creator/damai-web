<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createOrderColumns } from '@/components/admin/columns/orderColumns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useOrderListPage } from '@/composables/admin'

const OrderDetailDialog = defineAsyncComponent(
  () => import('@/components/features/admin-order/OrderDetailDialog.vue'),
)
const RefundDialog = defineAsyncComponent(
  () => import('@/components/features/checkout/RefundDialog.vue'),
)

const {
  currentPage,
  pageSize,
  searchStatus,
  showDetailDialog,
  selectedOrder,
  isDetailLoading,
  showRefundDialog,
  statusOptions,
  isLoading,
  canRefundSelectedOrder,
  list,
  totalRow,
  totalPages,
  refundMutation,
  handleSearch,
  openDetail,
  closeDetail,
  openRefundDialog,
  closeRefundDialog,
} = useOrderListPage()

const columns = createOrderColumns()
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :current-page="currentPage"
    :total-pages="totalPages"
    :page-size="pageSize"
    :total-row="totalRow"
    title="订单管理"
    :show-create-button="false"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @row-click="openDetail"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchStatus" @update:model-value="handleSearch">
          <SelectTrigger class="h-8 w-36" aria-label="筛选订单状态">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </template>
  </DataTableCrud>

  <OrderDetailDialog
    :order="selectedOrder"
    :open="showDetailDialog"
    :loading="isDetailLoading"
    :can-refund="canRefundSelectedOrder"
    :refund-loading="refundMutation.isPending.value"
    @update:open="!$event && closeDetail()"
    @close="closeDetail"
    @refund="openRefundDialog"
  />

  <RefundDialog
    :open="showRefundDialog"
    :loading="refundMutation.isPending.value"
    title="后台退款"
    description="确认退款后，订单会变为已退款，电子票作废，并同步退回库存。"
    submit-text="确认退款"
    @close="closeRefundDialog"
    @submit="refundMutation.mutate"
  />
</template>
