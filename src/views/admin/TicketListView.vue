<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ScanCheckinDialog from '@/components/admin/ScanCheckinDialog.vue'
import { Badge } from '@/components/common/ui/badge'
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
import type { TicketVO } from '@/api/ticket/types'
import { formatDateTime } from '@/utils/format'

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

const columns: ColumnDef<TicketVO>[] = [
  { accessorKey: 'id', header: 'ID', size: 100 },
  { accessorKey: 'ticketNo', header: '票号', size: 200 },
  { accessorKey: 'eventNameSnapshot', header: '活动' },
  { accessorKey: 'sessionNameSnapshot', header: '场次' },
  { accessorKey: 'ticketTypeNameSnapshot', header: '票档', size: 100 },
  { accessorKey: 'passengerNameSnapshot', header: '购票人', size: 100 },
  {
    accessorKey: 'status',
    header: '状态',
    size: 100,
    cell: ({ row }) => h(Badge, { variant: 'outline' }, () => row.original.statusLabel),
  },
  {
    accessorKey: 'createAt',
    header: '创建时间',
    size: 160,
    cell: ({ row }) => (row.original.createAt ? formatDateTime(row.original.createAt) : '--'),
  },
]
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
          <SelectTrigger class="h-8 w-28">
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
          @input="handleSearch"
        />
        <Input
          v-model="searchOrderId"
          placeholder="订单 ID"
          class="h-8 w-28"
          @input="handleSearch"
        />
        <Input
          v-model="searchEventId"
          placeholder="活动 ID"
          class="h-8 w-28"
          @input="handleSearch"
        />
        <Input
          v-model="searchSessionId"
          placeholder="场次 ID"
          class="h-8 w-28"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>

  <ScanCheckinDialog v-model:open="showScanDialog" />
</template>
