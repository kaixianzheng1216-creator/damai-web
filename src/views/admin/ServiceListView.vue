<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import {
  createServiceColumns,
  createServiceOptionColumns,
} from '@/components/admin/columns/serviceColumns'
import { Checkbox } from '@/components/common/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
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
    :confirm-dialog="confirmDialog"
    @create="openCreateService"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @close-confirm="closeConfirm"
    @confirm="handleConfirm"
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
    v-model:open="showServiceDialog"
    :title="serviceDialogTitle"
    description="维护服务保障名称和排序"
    :is-saving="createServiceMutation.isPending.value || updateServiceMutation.isPending.value"
    @submit="handleServiceSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <Label for="service-name"> 服务名称 <span class="text-destructive">*</span> </Label>
        <Input id="service-name" v-model="serviceForm.name" placeholder="请输入服务保障名称" />
      </div>
      <div class="grid gap-2">
        <Label for="service-sort-order">排序</Label>
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
    v-model:open="showOptionDialog"
    :title="optionDialogTitle"
    description="维护服务保障选项"
    :is-saving="createOptionMutation.isPending.value || updateOptionMutation.isPending.value"
    @submit="handleOptionSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <Label for="service-option-name"> 选项名称 <span class="text-destructive">*</span> </Label>
        <Input id="service-option-name" v-model="optionForm.name" placeholder="请输入选项名称" />
      </div>
      <div class="grid gap-2">
        <Label for="service-option-description">描述</Label>
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
        <Label for="service-option-boolean-type">布尔类型</Label>
        <span class="text-sm text-muted-foreground">
          {{ optionForm.isBooleanType === BOOLEAN_TYPE.YES ? '是' : '否' }}
        </span>
      </div>
    </div>
  </AdminFormDialog>
</template>
