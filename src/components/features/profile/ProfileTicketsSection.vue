<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { type ColumnDef } from '@tanstack/vue-table'
import type { TicketVO } from '@/api/ticket'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { formatDateTime } from '@/utils/format'
import { getTicketStatusClass } from '@/utils/statusMappers'

defineProps<{
  paginatedTickets: TicketVO[]
  ticketPage: number
  ticketTotalPages: number
  ticketPageSize?: number
  ticketTotalRow?: number
}>()

const emit = defineEmits<{
  'update:ticketPage': [page: number]
  'update:ticketPageSize': [pageSize: number]
}>()

const router = useRouter()

const viewTicketDetail = (ticketId: string) => {
  router.push(`/ticket/${ticketId}`)
}

const columns: ColumnDef<TicketVO>[] = [
  {
    accessorKey: 'eventNameSnapshot',
    header: '活动名称',
  },
  {
    accessorKey: 'ticketNo',
    header: '电子票号',
    size: 150,
  },
  {
    accessorKey: 'statusLabel',
    header: '状态',
    size: 120,
    cell: ({ row }) => {
      return h(
        Badge,
        { class: getTicketStatusClass(row.original.status) },
        () => row.original.statusLabel
      )
    },
  },
  {
    accessorKey: 'sessionStartAtSnapshot',
    header: '场次',
    size: 180,
    cell: ({ row }) => {
      return formatDateTime(row.original.sessionStartAtSnapshot)
    },
  },
  {
    accessorKey: 'venueNameSnapshot',
    header: '场馆',
  },
  {
    accessorKey: 'ticketTypeNameSnapshot',
    header: '票种',
  },
  {
    accessorKey: 'passengerNameSnapshot',
    header: '购票人',
    size: 120,
  },
  {
    id: 'actions',
    header: '操作',
    size: 120,
    cell: ({ row }) => {
      return h(
        Button,
        {
          size: 'sm',
          variant: 'outline',
          class: 'h-7 px-2',
          onClick: () => viewTicketDetail(row.original.id),
        },
        () => '查看详情'
      )
    },
  },
]
</script>

<template>
  <div class="lg:hidden">
    <div v-if="paginatedTickets.length === 0" class="flex min-h-[320px] items-center justify-center">
      <div class="text-center text-muted-foreground">
        <icon-lucide-inbox class="mx-auto h-12 w-12 mb-2" />
        <p>暂无数据</p>
      </div>
    </div>
    <div v-else class="space-y-4">
      <Card v-for="ticket in paginatedTickets" :key="ticket.id" class="cursor-pointer hover:border-primary/50 transition-colors" @click="viewTicketDetail(ticket.id)">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-base leading-tight">{{ ticket.eventNameSnapshot }}</CardTitle>
            <Badge :class="getTicketStatusClass(ticket.status)">{{ ticket.statusLabel }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <icon-lucide-ticket class="h-4 w-4 text-muted-foreground" />
            <span>电子票号: {{ ticket.ticketNo }}</span>
          </div>
          <div class="flex items-center gap-2">
            <icon-lucide-calendar class="h-4 w-4 text-muted-foreground" />
            <span>场次: {{ formatDateTime(ticket.sessionStartAtSnapshot) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <icon-lucide-map-pin class="h-4 w-4 text-muted-foreground" />
            <span>场馆: {{ ticket.venueNameSnapshot }}</span>
          </div>
          <div class="flex items-center gap-2">
            <icon-lucide-ticket class="h-4 w-4 text-muted-foreground" />
            <span>票种: {{ ticket.ticketTypeNameSnapshot }}</span>
          </div>
          <div class="flex items-center gap-2">
            <icon-lucide-user class="h-4 w-4 text-muted-foreground" />
            <span>购票人: {{ ticket.passengerNameSnapshot }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <div class="hidden lg:block">
    <DataTableCrud
      :columns="columns"
      :data="paginatedTickets"
      :current-page="ticketPage"
      :total-pages="ticketTotalPages"
      :page-size="ticketPageSize || 10"
      :total-row="ticketTotalRow || 0"
      :show-create-button="false"
      @update:current-page="emit('update:ticketPage', $event)"
      @update:page-size="emit('update:ticketPageSize', $event)"
    />
  </div>
</template>
