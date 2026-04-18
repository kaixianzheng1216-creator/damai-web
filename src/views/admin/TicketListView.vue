<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ScanCheckinDialog from '@/components/admin/ScanCheckinDialog.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { fetchAdminTicketPage } from '@/api/ticket/ticket'
import { formatDateTime } from '@/utils/format'
import type { TicketVO } from '@/api/ticket/types'

const currentPage = ref(1)
const pageSize = ref(10)
const searchUserId = ref('')
const searchOrderId = ref('')
const searchEventId = ref('')
const searchSessionId = ref('')
const searchStatus = ref<string>('all')
const showScanDialog = ref(false)

const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '未使用', value: '0' },
  { label: '已使用', value: '1' },
  { label: '已作废', value: '2' },
  { label: '已退票', value: '3' },
]

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

const queryKey = computed(() => [
  'admin-ticket-list',
  currentPage.value,
  pageSize.value,
  searchUserId.value,
  searchOrderId.value,
  searchEventId.value,
  searchSessionId.value,
  searchStatus.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminTicketPage({
      page: currentPage.value,
      size: pageSize.value,
      userId: searchUserId.value || undefined,
      orderId: searchOrderId.value || undefined,
      eventId: searchEventId.value || undefined,
      sessionId: searchSessionId.value || undefined,
      status: searchStatus.value !== 'all' ? Number(searchStatus.value) : undefined,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const handleSearch = () => {
  currentPage.value = 1
}
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
        <Button size="sm" @click="showScanDialog = true">
          <icon-lucide-scan-line class="mr-1 h-4 w-4" />
          扫码检票
        </Button>
        <Select v-model="searchStatus" @update:model-value="handleSearch">
          <SelectTrigger class="h-8 w-28">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
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
