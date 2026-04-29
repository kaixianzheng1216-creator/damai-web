<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import {
  createServiceColumns,
  createServiceOptionColumns,
} from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Checkbox } from '@/components/common/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { useServiceListPage } from '@/composables/admin'
import { BOOLEAN_TYPE } from '@/constants'

const {
  currentPage,
  pageSize,
  searchName,
  isLoading,
  list,
  totalRow,
  totalPages,
  selectedService,
  currentOptions,
  showServiceDialog,
  showOptionsDialog,
  showOptionDialog,
  serviceForm,
  serviceDialogTitle,
  optionForm,
  optionDialogTitle,
  confirmDialog,
  createServiceMutation,
  updateServiceMutation,
  createOptionMutation,
  updateOptionMutation,
  openCreateService,
  openEditService,
  openManageOptions,
  openCreateOption,
  openEditOption,
  handleServiceSubmit,
  handleDeleteService,
  handleOptionSubmit,
  handleDeleteOption,
  setOptionBooleanType,
  closeConfirm,
  handleConfirm,
} = useServiceListPage()

const serviceColumns = createServiceColumns({
  openManageOptions,
  openEditService,
  handleDeleteService,
})

const optionColumns = createServiceOptionColumns({
  openEdit: openEditOption,
  handleDelete: handleDeleteOption,
})
</script>

<template>
  <DataTableCrud
    :columns="serviceColumns"
    :data="list"
    :loading="isLoading"
    :total-row="totalRow"
    :total-pages="totalPages"
    :current-page="currentPage"
    :page-size="pageSize"
    title="服务保障管理"
    @create="openCreateService"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input
          v-model="searchName"
          placeholder="搜索服务名称"
          class="h-8 w-48"
          aria-label="搜索服务保障名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-if="showServiceDialog"
    v-model:open="showServiceDialog"
    :title="serviceDialogTitle"
    description="维护服务保障名称和排序"
    :is-saving="createServiceMutation.isPending.value || updateServiceMutation.isPending.value"
    @submit="handleServiceSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="service-name" class="text-sm font-medium">
          服务名称 <span class="text-destructive">*</span>
        </label>
        <Input id="service-name" v-model="serviceForm.name" placeholder="请输入服务保障名称" />
      </div>
      <div class="grid gap-2">
        <label for="service-sort-order" class="text-sm font-medium">排序</label>
        <Input
          id="service-sort-order"
          v-model.number="serviceForm.sortOrder"
          type="number"
          placeholder="排序权重（可选，数值越小越靠前）"
        />
      </div>
    </div>
  </AdminFormDialog>

  <Dialog v-model:open="showOptionsDialog">
    <DialogContent class="w-[95vw] max-w-[1100px] sm:max-w-none">
      <DialogHeader>
        <DialogTitle>「{{ selectedService?.name }}」的选项</DialogTitle>
      </DialogHeader>

      <DataTableCrud
        class="py-4"
        :columns="optionColumns"
        :data="currentOptions"
        :total-row="currentOptions.length"
        :show-pagination="false"
        title="服务选项"
        @create="openCreateOption"
      />
    </DialogContent>
  </Dialog>

  <AdminFormDialog
    v-if="showOptionDialog"
    v-model:open="showOptionDialog"
    :title="optionDialogTitle"
    description="维护服务保障选项"
    :is-saving="createOptionMutation.isPending.value || updateOptionMutation.isPending.value"
    @submit="handleOptionSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="service-option-name" class="text-sm font-medium">
          选项名称 <span class="text-destructive">*</span>
        </label>
        <Input id="service-option-name" v-model="optionForm.name" placeholder="请输入选项名称" />
      </div>
      <div class="grid gap-2">
        <label for="service-option-description" class="text-sm font-medium">描述</label>
        <Input
          id="service-option-description"
          v-model="optionForm.description"
          placeholder="请输入描述（可选）"
        />
      </div>
      <div class="flex items-center gap-3">
        <Checkbox
          id="service-option-boolean-type"
          :checked="optionForm.isBooleanType === BOOLEAN_TYPE.YES"
          @update:checked="setOptionBooleanType"
        />
        <label for="service-option-boolean-type" class="text-sm font-medium">布尔类型</label>
        <span class="text-sm text-muted-foreground">
          {{ optionForm.isBooleanType === BOOLEAN_TYPE.YES ? '是' : '否' }}
        </span>
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
