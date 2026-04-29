<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createSeriesColumns } from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Input } from '@/components/common/ui/input'
import { useSeriesListPage } from '@/composables/admin'

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
  closeConfirm,
  handleConfirm,
} = useSeriesListPage()

const columns = createSeriesColumns({ openEdit, handleDelete })
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
    title="系列管理"
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
          placeholder="搜索系列名称"
          class="h-8 w-48"
          aria-label="搜索系列名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-if="showDialog"
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护活动系列名称"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="series-name" class="text-sm font-medium">
          系列名称 <span class="text-destructive">*</span>
        </label>
        <Input id="series-name" v-model="form.name" placeholder="请输入系列名称" />
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
