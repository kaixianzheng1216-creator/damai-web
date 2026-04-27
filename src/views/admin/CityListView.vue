<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
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
import { useCityListPage } from '@/composables/admin'
import type { CityVO } from '@/api/event'

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
  toggleFeatured,
  closeConfirm,
  handleConfirm,
} = useCityListPage()

const columns: ColumnDef<CityVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '城市名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'pinyin',
    header: '拼音',
    cell: ({ row }) => String(row.getValue('pinyin')),
  },
  {
    accessorKey: 'firstLetter',
    header: '首字母',
    size: 80,
    cell: ({ row }) => String(row.getValue('firstLetter')),
  },
  {
    accessorKey: 'isFeatured',
    header: '热门',
    size: 100,
    cell: ({ row }) => {
      const isFeatured = row.original.isFeatured === 1
      return h(
        Button,
        {
          size: 'sm',
          variant: isFeatured ? 'default' : 'outline',
          class: 'h-6 px-2 text-xs',
          onClick: (event: Event) => {
            event.stopPropagation()
            toggleFeatured(row.original)
          },
        },
        () => (isFeatured ? '热门' : '普通'),
      )
    },
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
    title="城市管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input v-model="searchName" placeholder="搜索城市名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog v-model:open="showDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">维护城市名称、拼音和首字母</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label for="city-name" class="text-sm font-medium">
            城市名 <span class="text-destructive">*</span>
          </label>
          <Input id="city-name" v-model="form.name" placeholder="请输入城市名" />
        </div>
        <div class="grid gap-2">
          <label for="city-pinyin" class="text-sm font-medium">
            拼音 <span class="text-destructive">*</span>
          </label>
          <Input id="city-pinyin" v-model="form.pinyin" placeholder="请输入拼音，如 beijing" />
        </div>
        <div class="grid gap-2">
          <label for="city-first-letter" class="text-sm font-medium">
            首字母 <span class="text-destructive">*</span>
          </label>
          <Input
            id="city-first-letter"
            v-model="form.firstLetter"
            placeholder="请输入首字母，如 B"
            maxlength="1"
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
