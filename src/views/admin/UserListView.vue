<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createUserColumns } from '@/components/admin/listPageColumns'
import { Input } from '@/components/common/ui/input'
import { fetchAdminUserPage, updateAdminUserStatus } from '@/api/account/user'
import type { UserVO } from '@/api/account'
import { USER_STATUS, queryKeys } from '@/constants'

const queryClient = useQueryClient()
const currentPage = ref(1)
const pageSize = ref(10)
const searchUsername = ref('')
const searchMobile = ref('')

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

const columns = createUserColumns({ toggleStatus })
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
          aria-label="搜索用户用户名"
          @input="handleSearch"
        />
        <Input
          v-model="searchMobile"
          placeholder="搜索手机号"
          class="h-8 w-36"
          aria-label="搜索用户手机号"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>
</template>
