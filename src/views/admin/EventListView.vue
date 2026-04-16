<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { fetchAdminEventPage, deleteEvent, publishEvent, offlineEvent } from '@/api/event/event'
import { formatPrice } from '@/utils/format'
import type { EventVO } from '@/api/event'

const router = useRouter()
const queryClient = useQueryClient()

const currentPage = ref(1)
const pageSize = ref(10)
const searchName = ref('')

const columns: ColumnDef<EventVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 100,
  },
  {
    accessorKey: 'name',
    header: '活动名称',
  },
  {
    accessorKey: 'cityNameSnapshot',
    header: '城市',
    size: 100,
  },
  {
    accessorKey: 'categoryNameSnapshot',
    header: '分类',
    size: 100,
  },
  {
    accessorKey: 'minPrice',
    header: '最低票价',
    size: 120,
    cell: ({ row }) => {
      return row.original.minPrice != null ? formatPrice(row.original.minPrice) : '-'
    },
  },
  {
    accessorKey: 'statusLabel',
    header: '状态',
    size: 100,
    cell: ({ row }) => {
      const variant =
        row.original.status === 1 ? 'default' : row.original.status === 2 ? 'secondary' : 'outline'
      return h(Badge, { variant }, () => row.original.statusLabel)
    },
  },
  {
    accessorKey: 'recommendWeight',
    header: '推荐权重',
    size: 100,
    cell: ({ row }) => {
      return row.original.recommendWeight ?? '-'
    },
  },
  {
    id: 'actions',
    header: '',
    size: 280,
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex items-center justify-end gap-1' },
        [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              class: 'h-7 px-2 text-muted-foreground hover:text-foreground',
              onClick: () => openEdit(row.original),
            },
            {
              default: () => [
                h('icon-lucide-pencil', { class: 'h-3.5 w-3.5' }),
                h('span', { class: 'ml-1 text-xs' }, '编辑'),
              ],
            }
          ),
          row.original.status === 0
            ? h(
                Button,
                {
                  variant: 'ghost',
                  size: 'sm',
                  class: 'h-7 px-2 text-muted-foreground hover:text-primary',
                  onClick: () => handlePublish(row.original),
                },
                {
                  default: () => [
                    h('icon-lucide-rocket', { class: 'h-3.5 w-3.5' }),
                    h('span', { class: 'ml-1 text-xs' }, '发布'),
                  ],
                }
              )
            : null,
          row.original.status === 1
            ? h(
                Button,
                {
                  variant: 'ghost',
                  size: 'sm',
                  class: 'h-7 px-2 text-muted-foreground hover:text-destructive',
                  onClick: () => handleOffline(row.original),
                },
                {
                  default: () => [
                    h('icon-lucide-power-off', { class: 'h-3.5 w-3.5' }),
                    h('span', { class: 'ml-1 text-xs' }, '下线'),
                  ],
                }
              )
            : null,
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              class: 'h-7 px-2 text-muted-foreground hover:text-destructive',
              onClick: () => handleDelete(row.original),
            },
            {
              default: () => [
                h('icon-lucide-trash2', { class: 'h-3.5 w-3.5' }),
                h('span', { class: 'ml-1 text-xs' }, '删除'),
              ],
            }
          ),
        ].filter(Boolean)
      )
    },
  },
]

const queryKey = computed(() => ['admin-events', currentPage.value, searchName.value])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminEventPage({
      name: searchName.value || undefined,
      page: currentPage.value,
      size: pageSize.value,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => data.value?.totalRow ?? 0)
const totalPages = computed(() => data.value?.totalPage ?? 1)

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-events'] })

const openCreate = () => {
  router.push('/admin/events/create')
}

const openEdit = (row: EventVO) => {
  router.push(`/admin/events/${row.id}/edit`)
}

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteEvent(id),
  onSuccess: invalidate,
})

const publishMutation = useMutation({
  mutationFn: (id: string) => publishEvent(id),
  onSuccess: invalidate,
})

const offlineMutation = useMutation({
  mutationFn: (id: string) => offlineEvent(id),
  onSuccess: invalidate,
})

const handleDelete = (row: EventVO) => {
  openConfirm('确认删除', `确认删除活动「${row.name}」？`, () => deleteMutation.mutate(row.id))
}

const handlePublish = (row: EventVO) => {
  openConfirm('确认发布', `确认发布活动「${row.name}」？`, () => publishMutation.mutate(row.id))
}

const handleOffline = (row: EventVO) => {
  openConfirm('确认下线', `确认下线活动「${row.name}」？`, () => offlineMutation.mutate(row.id))
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }

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
    title="活动管理"
    @create="openCreate"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex items-center gap-2">
        <Input v-model="searchName" placeholder="搜索活动名称" class="w-64" />
        <Button size="sm" @click="openCreate">
          <icon-lucide-plus class="mr-1.5 h-4 w-4" />
          新建
        </Button>
      </div>
    </template>
  </DataTableCrud>

  <ConfirmDialog :open="confirmDialog.open" :title="confirmDialog.title"
    :description="confirmDialog.description" @close="closeConfirm" @confirm="handleConfirm" />
</template>
