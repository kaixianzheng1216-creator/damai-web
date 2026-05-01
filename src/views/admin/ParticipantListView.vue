<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createParticipantColumns } from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { Input } from '@/components/common/ui/input'
import { useParticipantListPage } from '@/composables/admin'

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
} = useParticipantListPage()

const columns = createParticipantColumns({ openEdit, handleDelete })
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
    title="参与方管理"
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
          placeholder="搜索参与方名称"
          class="h-8 w-48"
          aria-label="搜索参与方名称"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护参与方名称与头像"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="participant-name" class="text-sm font-medium">
          名称 <span class="text-destructive">*</span>
        </label>
        <Input id="participant-name" v-model="form.name" placeholder="请输入参与方名称" />
      </div>
      <div class="grid gap-2">
        <label class="text-sm font-medium">头像</label>
        <ImageUpload
          v-model="form.avatarUrl"
          preview-alt="参与方头像预览"
          upload-label="上传参与方头像"
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
