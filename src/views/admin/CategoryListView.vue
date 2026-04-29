<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import {
  createCategoryChildColumns,
  createCategoryColumns,
} from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { useCategoryListPage } from '@/composables/admin'

const {
  currentPage,
  pageSize,
  searchName,
  isLoading,
  list,
  totalRow,
  totalPages,
  showDialog,
  showChildrenDialog,
  showChildDialog,
  selectedParent,
  currentChildren,
  form,
  childForm,
  dialogTitle,
  childDialogTitle,
  confirmDialog,
  createMutation,
  updateMutation,
  createChildMutation,
  updateChildMutation,
  openCreate,
  openEdit,
  openManageChildren,
  openCreateChild,
  openEditChild,
  handleSubmit,
  handleChildSubmit,
  handleDelete,
  handleDeleteChild,
  closeConfirm,
  handleConfirm,
} = useCategoryListPage()

const columns = createCategoryColumns({ openManageChildren, openEdit, handleDelete })

const childColumns = createCategoryChildColumns({
  openEdit: openEditChild,
  handleDelete: handleDeleteChild,
})
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
    title="分类管理"
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
          placeholder="搜索分类名称"
          class="h-8 w-48"
          aria-label="搜索分类名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-if="showDialog"
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护一级分类"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="category-name" class="text-sm font-medium">
          分类名 <span class="text-destructive">*</span>
        </label>
        <Input id="category-name" v-model="form.name" placeholder="请输入分类名" />
      </div>
      <div class="grid gap-2">
        <label for="category-sort-order" class="text-sm font-medium">排序</label>
        <Input
          id="category-sort-order"
          v-model.number="form.sortOrder"
          type="number"
          placeholder="请输入排序值（数字越小越靠前）"
        />
      </div>
    </div>
  </AdminFormDialog>

  <Dialog v-model:open="showChildrenDialog">
    <DialogContent class="w-[95vw] max-w-[900px] sm:max-w-none">
      <DialogHeader>
        <DialogTitle>「{{ selectedParent?.name }}」的子分类</DialogTitle>
      </DialogHeader>

      <div class="py-4">
        <DataTableCrud
          :columns="childColumns"
          :data="currentChildren"
          :total-row="currentChildren.length"
          :show-pagination="false"
          title="子分类"
          @create="openCreateChild"
          @edit="openEditChild"
          @delete="handleDeleteChild"
        />
      </div>
    </DialogContent>
  </Dialog>

  <AdminFormDialog
    v-if="showChildDialog"
    v-model:open="showChildDialog"
    :title="childDialogTitle"
    description="维护子分类"
    :is-saving="createChildMutation.isPending.value || updateChildMutation.isPending.value"
    @submit="handleChildSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="child-category-name" class="text-sm font-medium">
          子分类名 <span class="text-destructive">*</span>
        </label>
        <Input id="child-category-name" v-model="childForm.name" placeholder="请输入子分类名" />
      </div>
      <div class="grid gap-2">
        <label for="child-category-sort-order" class="text-sm font-medium">排序</label>
        <Input
          id="child-category-sort-order"
          v-model.number="childForm.sortOrder"
          type="number"
          placeholder="请输入排序值（数字越小越靠前）"
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
