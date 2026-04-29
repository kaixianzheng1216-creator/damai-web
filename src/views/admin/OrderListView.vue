<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createOrderColumns } from '@/components/admin/listPageColumns'
import { Input } from '@/components/common/ui/input'
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

const {
  currentPage,
  pageSize,
  searchUserId,
  searchStatus,
  showDetailDialog,
  selectedOrder,
  statusOptions,
  isLoading,
  list,
  totalRow,
  totalPages,
  handleSearch,
  openDetail,
  closeDetail,
} = useOrderListPage()

const columns = createOrderColumns({ openDetail })
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
        <Input
          v-model="searchUserId"
          placeholder="用户 ID"
          class="h-8 w-40"
          aria-label="按用户 ID 搜索订单"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>

  <OrderDetailDialog
    v-if="showDetailDialog"
    :order="selectedOrder"
    :open="showDetailDialog"
    @close="closeDetail"
  />
</template>
