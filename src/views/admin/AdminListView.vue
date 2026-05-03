<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createAdminColumns } from '@/components/admin/columns/adminColumns'
import { Input } from '@/components/common/ui/input'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { useAdminListPage } from '@/composables/admin/list-pages'

const {
  currentPage,
  pageSize,
  searchUsername,
  searchMobile,
  isLoading,
  list,
  totalRow,
  totalPages,
  showDialog,
  editingId,
  form,
  dialogTitle,
  isSaving,
  handleSearch,
  openCreate,
  openEdit,
  handleSubmit,
  toggleStatus,
} = useAdminListPage()

const columns = createAdminColumns({ openEdit, toggleStatus })
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
    title="管理员管理"
    @create="openCreate"
    @edit="openEdit"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input
          v-model="searchUsername"
          placeholder="搜索用户名"
          class="h-8 w-36"
          aria-label="搜索管理员用户名"
          @input="handleSearch"
        />
        <Input
          v-model="searchMobile"
          placeholder="搜索手机号"
          class="h-8 w-36"
          aria-label="搜索管理员手机号"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护管理员手机号、用户名和头像"
    :is-saving="isSaving"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="admin-mobile" class="text-sm font-medium">
          手机号 <span class="text-destructive">*</span>
        </label>
        <Input
          id="admin-mobile"
          v-model="form.mobile"
          placeholder="请输入手机号"
          type="tel"
          :disabled="!!editingId"
        />
      </div>
      <div class="grid gap-2">
        <label for="admin-username" class="text-sm font-medium">用户名</label>
        <Input id="admin-username" v-model="form.username" placeholder="请输入用户名（可选）" />
      </div>
      <div v-if="editingId" class="grid gap-2">
        <label class="text-sm font-medium">头像</label>
        <ImageUpload
          v-model="form.avatarUrl"
          preview-alt="管理员头像预览"
          upload-label="上传管理员头像"
        />
      </div>
    </div>
  </AdminFormDialog>
</template>
