<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import { fetchAdminUserPage, updateAdminUserStatus } from '@/api/account/user'
import type { UserVO } from '@/api/account'
import { USER_STATUS, queryKeys } from '@/constants'

const queryClient = useQueryClient()
const currentPage = ref(1)
const pageSize = ref(10)
const searchUsername = ref('')
const searchMobile = ref('')

const columns: ColumnDef<UserVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'avatarUrl',
    header: '头像',
    size: 80,
    cell: ({ row }) =>
      row.original.avatarUrl
        ? h('img', { src: row.original.avatarUrl, class: 'h-8 w-8 rounded-full object-cover' })
        : null,
  },
  {
    accessorKey: 'username',
    header: '用户名',
  },
  {
    accessorKey: 'mobile',
    header: '手机号',
  },
  {
    accessorKey: 'status',
    header: '状态',
    size: 100,
    cell: ({ row }) =>
      h(
        Badge,
        { variant: 'outline' },
        { default: () => (row.original.status === USER_STATUS.NORMAL ? '正常' : '封禁') },
      ),
  },
  {
    id: 'actions',
    header: '操作',
    size: 120,
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: row.original.status === USER_STATUS.NORMAL ? 'destructive' : 'default',
          size: 'sm',
          onClick: (e: Event) => {
            e.stopPropagation()
            toggleStatus(row.original)
          },
        },
        () => (row.original.status === USER_STATUS.NORMAL ? '封禁' : '解封'),
      ),
  },
]

const queryKey = computed(() => [
  ...queryKeys.admin.list('users'),
  currentPage.value,
  pageSize.value,
  searchUsername.value,
  searchMobile.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminUserPage({
      page: currentPage.value,
      size: pageSize.value,
      username: searchUsername.value || undefined,
      mobile: searchMobile.value || undefined,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const handleSearch = () => {
  currentPage.value = 1
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('users') })

const statusMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: number }) => updateAdminUserStatus(id, status),
  onSuccess: invalidate,
})

const toggleStatus = (row: UserVO) => {
  const newStatus = row.status === USER_STATUS.NORMAL ? USER_STATUS.BANNED : USER_STATUS.NORMAL
  statusMutation.mutate({ id: row.id, status: newStatus })
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
    title="用户管理"
    :show-create-button="false"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input
          v-model="searchUsername"
          placeholder="搜索用户名"
          class="h-8 w-36"
          @input="handleSearch"
        />
        <Input
          v-model="searchMobile"
          placeholder="搜索手机号"
          class="h-8 w-36"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>
</template>
