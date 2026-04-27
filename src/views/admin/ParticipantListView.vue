<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { Button } from '@/components/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { useParticipantListPage } from '@/composables/admin'
import type { ParticipantVO } from '@/api/event'

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

const columns: ColumnDef<ParticipantVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    id: 'avatar',
    header: '头像',
    size: 100,
    cell: ({ row }) => {
      const avatarUrl = row.original.avatarUrl
      return avatarUrl
        ? h('img', {
            src: avatarUrl,
            alt: row.original.name,
            class: 'h-10 w-10 rounded-full border border-border object-cover',
          })
        : h(
            'div',
            {
              class: 'flex-center h-10 w-10 rounded-full bg-muted text-muted-foreground',
            },
            '暂无',
          )
    },
  },
  {
    accessorKey: 'name',
    header: '名称',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    id: 'actions',
    header: '操作',
    size: 160,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: (event: Event) => {
              event.stopPropagation()
              openEdit(row.original)
            },
          },
          () => '编辑',
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            onClick: (event: Event) => {
              event.stopPropagation()
              handleDelete(row.original)
            },
          },
          () => '删除',
        ),
      ]),
  },
]
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
        <Input v-model="searchName" placeholder="搜索参与方名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog v-model:open="showDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">维护参与方名称与头像</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label for="participant-name" class="text-sm font-medium">
            名称 <span class="text-destructive">*</span>
          </label>
          <Input id="participant-name" v-model="form.name" placeholder="请输入参与方名称" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">头像</label>
          <ImageUpload v-model="form.avatarUrl" />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="showDialog = false">取消</Button>
        <Button
          type="button"
          :disabled="createMutation.isPending.value || updateMutation.isPending.value"
          @click="handleSubmit"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
