<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createParticipantColumns } from '@/components/admin/columns/participantColumns'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
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
        <Label for="participant-name"> 名称 <span class="text-destructive">*</span> </Label>
        <Input id="participant-name" v-model="form.name" placeholder="请输入参与方名称" />
      </div>
      <div class="grid gap-2">
        <Label>头像</Label>
        <ImageUpload
          v-model="form.avatarUrl"
          upload-mode="admin"
          preview-alt="参与方头像预览"
          upload-label="上传参与方头像"
        />
      </div>
    </div>
  </AdminFormDialog>
</template>
