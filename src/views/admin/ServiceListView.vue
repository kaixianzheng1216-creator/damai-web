<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import { Checkbox } from '@/components/common/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog'
import { Input } from '@/components/common/ui/input'
import { useServiceListPage } from '@/composables/admin'
import type { ServiceGuaranteeOptionVO, ServiceGuaranteeVO } from '@/api/event'
import { BOOLEAN_TYPE } from '@/constants'

const {
  currentPage,
  pageSize,
  searchName,
  isLoading,
  list,
  totalRow,
  totalPages,
  selectedService,
  currentOptions,
  showServiceDialog,
  showOptionsDialog,
  showOptionDialog,
  serviceForm,
  serviceDialogTitle,
  optionForm,
  optionDialogTitle,
  confirmDialog,
  createServiceMutation,
  updateServiceMutation,
  createOptionMutation,
  updateOptionMutation,
  openCreateService,
  openEditService,
  openManageOptions,
  openCreateOption,
  openEditOption,
  handleServiceSubmit,
  handleDeleteService,
  handleOptionSubmit,
  handleDeleteOption,
  setOptionBooleanType,
  closeConfirm,
  handleConfirm,
} = useServiceListPage()

const serviceColumns: ColumnDef<ServiceGuaranteeVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'name',
    header: '服务名称',
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 100,
  },
  {
    id: 'actions',
    header: '操作',
    size: 240,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: (event: Event) => {
              event.stopPropagation()
              openManageOptions(row.original)
            },
          },
          () => '管理选项',
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: (event: Event) => {
              event.stopPropagation()
              openEditService(row.original)
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
              handleDeleteService(row.original)
            },
          },
          () => '删除',
        ),
      ]),
  },
]

const optionColumns: ColumnDef<ServiceGuaranteeOptionVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 120,
  },
  {
    accessorKey: 'name',
    header: '选项名称',
    size: 150,
  },
  {
    accessorKey: 'description',
    header: '描述',
  },
  {
    accessorKey: 'isBooleanType',
    header: '布尔类型',
    size: 100,
    cell: ({ row }) => {
      const isBoolean = row.original.isBooleanType === BOOLEAN_TYPE.YES
      return h(Badge, { class: 'border border-border bg-transparent text-foreground' }, () =>
        isBoolean ? '是' : '否',
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
              openEditOption(row.original)
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
              handleDeleteOption(row.original)
            },
          },
          () => '删除',
        ),
      ]),
  },
]
</script>

<template>
  <div>
    <DataTableCrud
      :columns="serviceColumns"
      :data="list"
      :loading="isLoading"
      :total-row="totalRow"
      :total-pages="totalPages"
      :current-page="currentPage"
      :page-size="pageSize"
      title="服务保障管理"
      @create="openCreateService"
      @edit="openEditService"
      @delete="handleDeleteService"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event"
    >
      <template #toolbar>
        <div class="flex flex-wrap items-center gap-2">
          <Input v-model="searchName" placeholder="搜索服务名称" class="h-8 w-48" />
        </div>
      </template>
    </DataTableCrud>
  </div>

  <Dialog v-model:open="showServiceDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ serviceDialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label for="service-name" class="text-sm font-medium">
            服务名称 <span class="text-destructive">*</span>
          </label>
          <Input id="service-name" v-model="serviceForm.name" placeholder="请输入服务保障名称" />
        </div>
        <div class="grid gap-2">
          <label for="service-sort-order" class="text-sm font-medium">排序</label>
          <Input
            id="service-sort-order"
            v-model.number="serviceForm.sortOrder"
            type="number"
            placeholder="排序权重（可选，数值越小越靠前）"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="showServiceDialog = false">取消</Button>
        <Button
          type="button"
          :disabled="createServiceMutation.isPending.value || updateServiceMutation.isPending.value"
          @click="handleServiceSubmit"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="showOptionsDialog">
    <DialogContent class="w-[95vw] max-w-[1100px] sm:max-w-none">
      <DialogHeader>
        <DialogTitle>「{{ selectedService?.name }}」的选项</DialogTitle>
      </DialogHeader>

      <div class="py-4">
        <DataTableCrud
          :columns="optionColumns"
          :data="currentOptions"
          :total-row="currentOptions.length"
          :show-pagination="false"
          title="服务选项"
          @create="openCreateOption"
          @edit="openEditOption"
          @delete="handleDeleteOption"
        />
      </div>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="showOptionDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ optionDialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label for="service-option-name" class="text-sm font-medium">
            选项名称 <span class="text-destructive">*</span>
          </label>
          <Input id="service-option-name" v-model="optionForm.name" placeholder="请输入选项名称" />
        </div>
        <div class="grid gap-2">
          <label for="service-option-description" class="text-sm font-medium">描述</label>
          <Input
            id="service-option-description"
            v-model="optionForm.description"
            placeholder="请输入描述（可选）"
          />
        </div>
        <div class="flex items-center gap-3">
          <Checkbox
            id="service-option-boolean-type"
            :checked="optionForm.isBooleanType === BOOLEAN_TYPE.YES"
            @update:checked="setOptionBooleanType"
          />
          <label for="service-option-boolean-type" class="text-sm font-medium">布尔类型</label>
          <span class="text-sm text-muted-foreground">
            {{ optionForm.isBooleanType === BOOLEAN_TYPE.YES ? '是' : '否' }}
          </span>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="showOptionDialog = false">取消</Button>
        <Button
          type="button"
          :disabled="createOptionMutation.isPending.value || updateOptionMutation.isPending.value"
          @click="handleOptionSubmit"
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
