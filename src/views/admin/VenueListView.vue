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
import { useVenueListPage } from '@/composables/admin'
import type { VenueVO } from '@/api/event'

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
} = useVenueListPage()

const columns: ColumnDef<VenueVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '场馆名',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'province',
    header: '省份',
    size: 100,
    cell: ({ row }) => String(row.getValue('province') ?? ''),
  },
  {
    accessorKey: 'city',
    header: '城市',
    size: 100,
    cell: ({ row }) => String(row.getValue('city') ?? ''),
  },
  {
    accessorKey: 'district',
    header: '区县',
    size: 100,
    cell: ({ row }) => String(row.getValue('district') ?? ''),
  },
  {
    accessorKey: 'address',
    header: '地址',
    cell: ({ row }) => String(row.getValue('address') ?? ''),
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
    title="场馆管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input v-model="searchName" placeholder="搜索场馆名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog v-model:open="showDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">维护场馆基础信息与地址</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label for="venue-name" class="text-sm font-medium">
            场馆名 <span class="text-destructive">*</span>
          </label>
          <Input id="venue-name" v-model="form.name" placeholder="请输入场馆名" />
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div class="grid gap-2">
            <label for="venue-province" class="text-sm font-medium">
              省份 <span class="text-destructive">*</span>
            </label>
            <Input id="venue-province" v-model="form.province" placeholder="省份" />
          </div>
          <div class="grid gap-2">
            <label for="venue-city" class="text-sm font-medium">
              城市 <span class="text-destructive">*</span>
            </label>
            <Input id="venue-city" v-model="form.city" placeholder="城市" />
          </div>
          <div class="grid gap-2">
            <label for="venue-district" class="text-sm font-medium">区县</label>
            <Input id="venue-district" v-model="form.district" placeholder="区县" />
          </div>
        </div>
        <div class="grid gap-2">
          <label for="venue-address" class="text-sm font-medium">
            详细地址 <span class="text-destructive">*</span>
          </label>
          <Input id="venue-address" v-model="form.address" placeholder="请输入详细地址" />
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
