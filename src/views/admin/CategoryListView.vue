<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Button } from '@/components/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { useCategoryListPage } from '@/composables/admin'
import type { CategoryVO } from '@/api/event'

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

const columns: ColumnDef<CategoryVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '分类名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 80,
    cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
  },
  {
    accessorKey: 'parentId',
    header: '父分类ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('parentId') ?? ''),
  },
  {
    id: 'actions',
    header: '操作',
    size: 240,
    cell: ({ row }) => {
      const isRootCategory = row.original.parentId === '0'
      return h(
        'div',
        { class: 'flex items-center gap-2' },
        [
          isRootCategory
            ? h(
                Button,
                {
                  size: 'sm',
                  variant: 'outline',
                  onClick: (event: Event) => {
                    event.stopPropagation()
                    openManageChildren(row.original)
                  },
                },
                () => '管理子分类',
              )
            : null,
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
        ].filter(Boolean),
      )
    },
  },
]

const childColumns: ColumnDef<CategoryVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '子分类名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 80,
    cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
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
              openEditChild(row.original)
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
              handleDeleteChild(row.original)
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
    title="分类管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input v-model="searchName" placeholder="搜索分类名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog v-model:open="showDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
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

  <Dialog v-model:open="showChildDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ childDialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
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

      <DialogFooter>
        <Button type="button" variant="outline" @click="showChildDialog = false">取消</Button>
        <Button
          type="button"
          :disabled="createChildMutation.isPending.value || updateChildMutation.isPending.value"
          @click="handleChildSubmit"
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
