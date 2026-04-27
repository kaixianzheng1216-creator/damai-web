<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Badge } from '@/components/common/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useNoticeListPage } from '@/composables/admin'
import type { NoticeVO } from '@/api/event'
import { NOTICE_TYPE_LABEL } from '@/constants'

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

const columns: ColumnDef<NoticeVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'type',
    header: '类型',
    size: 120,
    cell: ({ row }) => {
      const type = row.original.type
      return h(
        Badge,
        { class: 'border border-border bg-transparent text-foreground' },
        () => NOTICE_TYPE_LABEL[type] ?? type,
      )
    },
  },
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 100,
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
    title="须知管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchType">
          <SelectTrigger class="h-8 w-28">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="1">购票须知</SelectItem>
            <SelectItem value="2">入场须知</SelectItem>
          </SelectContent>
        </Select>
        <Input v-model="searchName" placeholder="搜索须知名称" class="h-8 w-40" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog v-model:open="showDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">维护购票或入场须知</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label id="notice-type-label" class="text-sm font-medium">
            类型 <span class="text-destructive">*</span>
          </label>
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
          <label for="notice-name" class="text-sm font-medium">
            名称 <span class="text-destructive">*</span>
          </label>
          <Input id="notice-name" v-model="form.name" placeholder="请输入须知名称" />
        </div>
        <div class="grid gap-2">
          <label for="notice-sort-order" class="text-sm font-medium">排序</label>
          <Input
            id="notice-sort-order"
            v-model.number="form.sortOrder"
            type="number"
            placeholder="排序权重（可选，数值越小越靠前）"
          />
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
