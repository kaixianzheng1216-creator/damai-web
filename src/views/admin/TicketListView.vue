<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createTicketColumns } from '@/components/admin/listPageColumns'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useTicketListPage } from '@/composables/admin'

const ScanCheckinDialog = defineAsyncComponent(
  () => import('@/components/features/admin-ticket/ScanCheckinDialog.vue'),
)

const {
  currentPage,
  pageSize,
  searchUserId,
  searchOrderId,
  searchEventId,
  searchSessionId,
  searchStatus,
  showScanDialog,
  isLoading,
  list,
  totalRow,
  totalPages,
  statusOptions,
  handleSearch,
  openScanDialog,
} = useTicketListPage()

const columns = createTicketColumns()
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
    title="电子票管理"
    :show-create-button="false"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" @click="openScanDialog">
          <icon-lucide-scan-line class="mr-1 h-4 w-4" />
          扫码检票
        </Button>
        <Select v-model="searchStatus" @update:model-value="handleSearch">
          <SelectTrigger class="h-8 w-28" aria-label="筛选电子票状态">
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
          class="h-8 w-28"
          aria-label="按用户 ID 搜索电子票"
          @input="handleSearch"
        />
        <Input
          v-model="searchOrderId"
          placeholder="订单 ID"
          class="h-8 w-28"
          aria-label="按订单 ID 搜索电子票"
          @input="handleSearch"
        />
        <Input
          v-model="searchEventId"
          placeholder="活动 ID"
          class="h-8 w-28"
          aria-label="按活动 ID 搜索电子票"
          @input="handleSearch"
        />
        <Input
          v-model="searchSessionId"
          placeholder="场次 ID"
          class="h-8 w-28"
          aria-label="按场次 ID 搜索电子票"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>

  <ScanCheckinDialog v-model:open="showScanDialog" />
</template>
