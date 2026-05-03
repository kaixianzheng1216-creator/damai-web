<script setup lang="ts">
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createBannerColumns } from '@/components/admin/listPageColumns'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { Input } from '@/components/common/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useBannerListPage } from '@/composables/admin'

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

const columns = createBannerColumns({ citiesMap, openEdit, handleDelete })
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
    :confirm-dialog="confirmDialog"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @close-confirm="closeConfirm"
    @confirm="handleConfirm"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchCityId">
          <SelectTrigger class="h-8 w-32" aria-label="筛选 Banner 城市">
            <SelectValue placeholder="全部城市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部城市</SelectItem>
            <SelectItem v-for="city in citiesData ?? []" :key="city.id" :value="String(city.id)">
              {{ city.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          v-model="searchTitle"
          placeholder="搜索标题"
          class="h-8 w-36"
          aria-label="搜索 Banner 标题"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-model:open="showDialog"
    :title="dialogTitle"
    :description="dialogDescription"
    content-class="max-w-2xl sm:max-w-2xl"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
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
              <SelectItem v-for="city in citiesData ?? []" :key="city.id" :value="String(city.id)">
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
          <ImageUpload
            v-model="form.imageUrl"
            aspect-class="aspect-[5/2]"
            preview-alt="Banner PC 端图片预览"
            upload-label="上传 Banner PC 端图片"
          />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            移动端图片 <span class="text-destructive">*</span>
          </label>
          <ImageUpload
            v-model="form.mobileImageUrl"
            aspect-class="aspect-video"
            preview-alt="Banner 移动端图片预览"
            upload-label="上传 Banner 移动端图片"
          />
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
          <DateTimePicker
            v-model="form.displayStartAt"
            aria-label="选择 Banner 展示开始时间"
            placeholder="选择展示开始时间"
          />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">展示结束时间</label>
          <DateTimePicker
            v-model="form.displayEndAt"
            aria-label="选择 Banner 展示结束时间"
            placeholder="选择展示结束时间"
          />
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
  </AdminFormDialog>
</template>
