<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createCityColumns } from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Input } from '@/components/common/ui/input'
import { useCityListPage } from '@/composables/admin'

const {
  currentPage,
  pageSize,
  searchName,
  isLoading,
  list,
  totalRow,
  totalPages,
  showDialog,
  form,
  dialogTitle,
  confirmDialog,
  createMutation,
  updateMutation,
  openCreate,
  openEdit,
  handleSubmit,
  handleDelete,
  toggleFeatured,
  closeConfirm,
  handleConfirm,
} = useCityListPage()

const columns = createCityColumns({ toggleFeatured, openEdit, handleDelete })
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :total-row="totalRow"
    :total-pages="totalPages"
    :current-page="currentPage"
    :page-size="pageSize"
    title="城市管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input
          v-model="searchName"
          placeholder="搜索城市名称"
          class="h-8 w-48"
          aria-label="搜索城市名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-if="showDialog"
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护城市名称、拼音和首字母"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="city-name" class="text-sm font-medium">
          城市名 <span class="text-destructive">*</span>
        </label>
        <Input id="city-name" v-model="form.name" placeholder="请输入城市名" />
      </div>
      <div class="grid gap-2">
        <label for="city-pinyin" class="text-sm font-medium">
          拼音 <span class="text-destructive">*</span>
        </label>
        <Input id="city-pinyin" v-model="form.pinyin" placeholder="请输入拼音，如 beijing" />
      </div>
      <div class="grid gap-2">
        <label for="city-first-letter" class="text-sm font-medium">
          首字母 <span class="text-destructive">*</span>
        </label>
        <Input
          id="city-first-letter"
          v-model="form.firstLetter"
          placeholder="请输入首字母，如 B"
          maxlength="1"
        />
      </div>
    </div>
  </AdminFormDialog>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    :confirm-text="confirmDialog.confirmText"
    :confirm-variant="confirmDialog.confirmVariant"
    :loading="confirmDialog.isProcessing"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
