<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createVenueColumns } from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Input } from '@/components/common/ui/input'
import { useVenueListPage } from '@/composables/admin'

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
} = useVenueListPage()

const columns = createVenueColumns({ openEdit, handleDelete })
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
    title="场馆管理"
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
          placeholder="搜索场馆名称"
          class="h-8 w-48"
          aria-label="搜索场馆名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-if="showDialog"
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护场馆基础信息与地址"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="venue-name" class="text-sm font-medium">
          场馆名 <span class="text-destructive">*</span>
        </label>
        <Input id="venue-name" v-model="form.name" placeholder="请输入场馆名" />
      </div>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div class="grid gap-2">
          <label for="venue-province" class="text-sm font-medium">
            省份 <span class="text-destructive">*</span>
          </label>
          <Input id="venue-province" v-model="form.province" placeholder="省份" />
        </div>
        <div class="grid gap-2">
          <label for="venue-city" class="text-sm font-medium">
            城市 <span class="text-destructive">*</span>
          </label>
          <Input id="venue-city" v-model="form.city" placeholder="城市" />
        </div>
        <div class="grid gap-2">
          <label for="venue-district" class="text-sm font-medium">区县</label>
          <Input id="venue-district" v-model="form.district" placeholder="区县" />
        </div>
      </div>
      <div class="grid gap-2">
        <label for="venue-address" class="text-sm font-medium">
          详细地址 <span class="text-destructive">*</span>
        </label>
        <Input id="venue-address" v-model="form.address" placeholder="请输入详细地址" />
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
