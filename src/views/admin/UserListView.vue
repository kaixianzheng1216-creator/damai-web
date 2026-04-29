<script setup lang="ts">
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createUserColumns } from '@/components/admin/listPageColumns'
import { Input } from '@/components/common/ui/input'
import { useAdminUserListPage } from '@/composables/admin/list-pages'

const {
  currentPage,
  pageSize,
  searchUsername,
  searchMobile,
  isLoading,
  list,
  totalRow,
  totalPages,
  handleSearch,
  toggleStatus,
} = useAdminUserListPage()

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
