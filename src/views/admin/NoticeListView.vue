<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createNoticeColumns } from '@/components/admin/columns/noticeColumns'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useNoticeListPage } from '@/composables/admin'

const {
  currentPage,
  pageSize,
  searchName,
  searchType,
  isLoading,
  list,
  totalRow,
  totalPages,
  showDialog,
  editingId,
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
} = useNoticeListPage()

const columns = createNoticeColumns({ openEdit, handleDelete })
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
    title="须知管理"
    :confirm-dialog="confirmDialog"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @close-confirm="closeConfirm"
    @confirm="handleConfirm"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchType">
          <SelectTrigger class="h-8 w-28" aria-label="筛选须知类型">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="1">购票须知</SelectItem>
            <SelectItem value="2">入场须知</SelectItem>
          </SelectContent>
        </Select>
        <Input
          v-model="searchName"
          placeholder="搜索须知名称"
          class="h-8 w-40"
          aria-label="搜索须知名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护购票或入场须知"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <Label id="notice-type-label"> 类型 <span class="text-destructive">*</span> </Label>
        <Select
          :model-value="String(form.type)"
          :disabled="Boolean(editingId)"
          @update:model-value="(value) => (form.type = Number(value))"
        >
          <SelectTrigger aria-labelledby="notice-type-label">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">购票须知</SelectItem>
            <SelectItem value="2">入场须知</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="grid gap-2">
        <Label for="notice-name"> 名称 <span class="text-destructive">*</span> </Label>
        <Input id="notice-name" v-model="form.name" placeholder="请输入须知名称" />
      </div>
      <div class="grid gap-2">
        <Label for="notice-sort-order">排序</Label>
        <Input
          id="notice-sort-order"
          v-model.number="form.sortOrder"
          type="number"
          placeholder="排序权重（可选，数值越小越靠前）"
        />
      </div>
    </div>
  </AdminFormDialog>
</template>
