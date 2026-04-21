<script setup lang="ts">
import { h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { type ColumnDef } from '@tanstack/vue-table'
import type { UserFollowEventVO } from '@/api/event'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { Button } from '@/components/common/ui/button'
import { formatPrice, formatDateTime } from '@/utils/format'

defineProps<{
  paginatedEvents: UserFollowEventVO[]
  page: number
  totalPages: number
  pageSize?: number
  totalRow?: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'toggle-follow': [eventId: string]
}>()

const router = useRouter()
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const viewMode = computed(() => (isMobile.value ? 'card' : 'table'))

const viewEventDetail = (eventId: string) => {
  router.push(`/detail/${eventId}`)
}

const handleCardClick = (item: UserFollowEventVO) => {
  if (item.event) {
    viewEventDetail(item.event.id)
  }
}

const handleUnfollowClick = (eventId: string) => {
  emit('toggle-follow', eventId)
}

const columns: ColumnDef<UserFollowEventVO>[] = [
  {
    accessorKey: 'event',
    header: '活动名称',
    cell: ({ row }) => row.original.event?.name ?? '-',
  },
  {
    accessorKey: 'event.venueNameSnapshot',
    header: '场馆',
    size: 180,
    cell: ({ row }) => row.original.event?.venueNameSnapshot ?? '-',
  },
  {
    accessorKey: 'event.firstSessionStartAt',
    header: '时间',
    size: 180,
    cell: ({ row }) =>
      row.original.event?.firstSessionStartAt
        ? formatDateTime(row.original.event.firstSessionStartAt)
        : '-',
  },
  {
    accessorKey: 'event.minPrice',
    header: '价格',
    size: 120,
    cell: ({ row }) =>
      row.original.event?.minPrice != null ? formatPrice(row.original.event.minPrice) : '-',
  },
  {
    accessorKey: 'createAt',
    header: '关注时间',
    size: 180,
  },
  {
    id: 'actions',
    header: '操作',
    size: 120,
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: () => emit('toggle-follow', row.original.eventId),
        },
        () => '取消关注',
      ),
  },
]
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="paginatedEvents"
    :current-page="page"
    :total-pages="totalPages"
    :page-size="pageSize || 10"
    :total-row="totalRow || 0"
    :show-create-button="false"
    :view-mode="viewMode"
    @update:current-page="emit('update:page', $event)"
    @update:page-size="emit('update:pageSize', $event)"
    @row-click="(item) => item.event && viewEventDetail(item.event.id)"
  >
    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <Card
          v-for="item in data"
          :key="item.id"
          class="cursor-pointer hover:border-primary/50 transition-colors"
          @click="handleCardClick(item)"
        >
          <CardHeader v-if="item.event" class="pb-3">
            <div class="flex items-start justify-between gap-2">
              <CardTitle class="text-base leading-tight">{{ item.event.name }}</CardTitle>
              <Button variant="outline" size="sm" @click.stop="handleUnfollowClick(item.eventId)">
                取消关注
              </Button>
            </div>
          </CardHeader>
          <CardContent v-if="item.event" class="space-y-2 text-sm">
            <div v-if="item.event.venueNameSnapshot" class="flex items-center gap-2">
              <icon-lucide-map-pin class="h-4 w-4 text-muted-foreground" />
              <span>{{ item.event.venueNameSnapshot }}</span>
            </div>
            <div v-if="item.event.firstSessionStartAt" class="flex items-center gap-2">
              <icon-lucide-calendar class="h-4 w-4 text-muted-foreground" />
              <span>{{ formatDateTime(item.event.firstSessionStartAt) }}</span>
            </div>
            <div v-if="item.event.minPrice != null" class="flex items-center gap-2">
              <span class="font-semibold text-primary">{{ formatPrice(item.event.minPrice) }}</span>
              <span
                v-if="item.event.maxPrice != null && item.event.maxPrice !== item.event.minPrice"
              >
                — {{ formatPrice(item.event.maxPrice) }}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </DataTableCrud>
</template>
