<script setup lang="ts">
import { createEventColumns } from '@/components/admin/listPageColumns'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useAdminEventListPage } from '@/composables/admin/list-pages'

const {
  currentPage,
  pageSize,
  searchName,
  searchCityId,
  searchCategoryId,
  citiesData,
  categoriesData,
  isLoading,
  list,
  totalRow,
  totalPages,
  confirmDialog,
  openCreate,
  openEdit,
  handleDelete,
  handlePublish,
  handleOffline,
  closeConfirm,
  handleConfirm,
} = useAdminEventListPage()

const columns = createEventColumns({ openEdit, handleDelete, handlePublish, handleOffline })
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
    :confirm-dialog="confirmDialog"
    @create="openCreate"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @close-confirm="closeConfirm"
    @confirm="handleConfirm"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchCityId">
          <SelectTrigger class="h-8 w-28" aria-label="筛选城市">
            <SelectValue placeholder="全部城市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部城市</SelectItem>
            <SelectItem v-for="city in citiesData ?? []" :key="city.id" :value="String(city.id)">
              {{ city.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="searchCategoryId">
          <SelectTrigger class="h-8 w-28" aria-label="筛选分类">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem v-for="cat in categoriesData ?? []" :key="cat.id" :value="String(cat.id)">
              {{ cat.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          v-model="searchName"
          placeholder="搜索活动名称"
          class="h-8 w-48"
          aria-label="搜索活动名称"
        />
      </div>
    </template>
  </DataTableCrud>
</template>
