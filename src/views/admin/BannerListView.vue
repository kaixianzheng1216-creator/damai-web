<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useBannerListPage } from '@/composables/admin'
import type { BannerVO } from '@/api/event'
import { formatDateTime } from '@/utils/format'

const {
  currentPage,
  pageSize,
  searchTitle,
  searchCityId,
  citiesData,
  citiesMap,
  isLoading,
  list,
  totalRow,
  totalPages,
  showDialog,
  form,
  dialogTitle,
  dialogDescription,
  confirmDialog,
  createMutation,
  updateMutation,
  openCreate,
  openEdit,
  handleSubmit,
  handleDelete,
  closeConfirm,
  handleConfirm,
} = useBannerListPage()

const columns: ColumnDef<BannerVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 100,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'title',
    header: '标题',
  },
  {
    accessorKey: 'cityId',
    header: '城市',
    size: 100,
    cell: ({ row }) => {
      const cityId = String(row.getValue('cityId'))
      return citiesMap.value.get(cityId)?.name ?? cityId
    },
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 80,
    cell: ({ row }) => String(row.getValue('sortOrder') ?? ''),
  },
  {
    accessorKey: 'displayStartAt',
    header: '展示开始时间',
    size: 160,
    cell: ({ row }) => formatDateTime(row.original.displayStartAt),
  },
  {
    accessorKey: 'displayEndAt',
    header: '展示结束时间',
    size: 160,
    cell: ({ row }) => formatDateTime(row.original.displayEndAt),
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
    :current-page="currentPage"
    :total-pages="totalPages"
    :page-size="pageSize"
    :total-row="totalRow"
    title="Banner 管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchCityId">
          <SelectTrigger class="h-8 w-32">
            <SelectValue placeholder="全部城市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部城市</SelectItem>
            <SelectItem v-for="city in citiesData ?? []" :key="city.id" :value="String(city.id)">
              {{ city.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input v-model="searchTitle" placeholder="搜索标题" class="h-8 w-36" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog v-model:open="showDialog">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">{{ dialogDescription }}</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <label for="banner-title" class="text-sm font-medium">
              标题 <span class="text-destructive">*</span>
            </label>
            <Input id="banner-title" v-model="form.title" placeholder="请输入 Banner 标题" />
          </div>
          <div class="grid gap-2">
            <label id="banner-city-label" class="text-sm font-medium">
              城市 <span class="text-destructive">*</span>
            </label>
            <Select v-model="form.cityId">
              <SelectTrigger aria-labelledby="banner-city-label">
                <SelectValue placeholder="请选择城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="city in citiesData ?? []"
                  :key="city.id"
                  :value="String(city.id)"
                >
                  {{ city.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">
              PC 端图片 <span class="text-destructive">*</span>
            </label>
            <ImageUpload v-model="form.imageUrl" aspect-class="aspect-[5/2]" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">
              移动端图片 <span class="text-destructive">*</span>
            </label>
            <ImageUpload v-model="form.mobileImageUrl" aspect-class="aspect-video" />
          </div>
        </div>

        <div class="grid gap-2">
          <label for="banner-jump-url" class="text-sm font-medium">
            跳转 URL <span class="text-destructive">*</span>
          </label>
          <Input id="banner-jump-url" v-model="form.jumpUrl" placeholder="请输入跳转链接" />
        </div>

        <div class="grid gap-4">
          <div class="grid gap-2">
            <label class="text-sm font-medium">展示开始时间</label>
            <DateTimePicker v-model="form.displayStartAt" placeholder="选择展示开始时间" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">展示结束时间</label>
            <DateTimePicker v-model="form.displayEndAt" placeholder="选择展示结束时间" />
          </div>
          <div class="grid gap-2">
            <label for="banner-sort-order" class="text-sm font-medium">排序</label>
            <Input
              id="banner-sort-order"
              v-model.number="form.sortOrder"
              type="number"
              placeholder="排序值"
            />
          </div>
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
