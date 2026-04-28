<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
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
import OrderDetailDialog from '@/components/features/admin-order/OrderDetailDialog.vue'
import { fetchAdminOrderPage } from '@/api/trade'
import { ORDER_STATUS, queryKeys } from '@/constants'
import type { TicketOrderPageRequest, TicketOrderVO } from '@/api/trade'

const currentPage = ref(1)
const pageSize = ref(10)
const searchUserId = ref('')
const searchStatus = ref<string>('')
const showDetailDrawer = ref(false)
const selectedOrder = ref<TicketOrderVO | null>(null)

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待付款', value: String(ORDER_STATUS.PENDING) },
  { label: '已支付', value: String(ORDER_STATUS.PAID) },
  { label: '已取消', value: String(ORDER_STATUS.CANCELLED) },
  { label: '已关闭', value: String(ORDER_STATUS.CLOSED) },
  { label: '已退款', value: String(ORDER_STATUS.REFUNDED) },
]

const queryKey = computed(() => [
  ...queryKeys.admin.list('orders'),
  currentPage.value,
  pageSize.value,
  searchUserId.value,
  searchStatus.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminOrderPage({
      page: currentPage.value,
      size: pageSize.value,
      userId: searchUserId.value || undefined,
      status: searchStatus.value !== '' ? Number(searchStatus.value) : undefined,
    } as TicketOrderPageRequest),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const handleSearch = () => {
  currentPage.value = 1
}

const openDetail = (row: TicketOrderVO) => {
  selectedOrder.value = row
  showDetailDrawer.value = true
}

const columns = createOrderColumns({ openDetail })

watch([searchUserId], () => {
  currentPage.value = 1
})
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
    :order="selectedOrder"
    :open="showDetailDrawer"
    @close="showDetailDrawer = false"
  />
</template>
