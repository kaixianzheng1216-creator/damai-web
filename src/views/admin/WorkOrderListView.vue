<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { createWorkOrderColumns } from '@/components/admin/listPageColumns'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { useAdminWorkOrderListPage } from '@/composables/admin/list-pages'

const WorkOrderDetailDialog = defineAsyncComponent(
  () => import('@/components/features/admin-work-order/WorkOrderDetailDialog.vue'),
)

const {
  currentPage,
  pageSize,
  searchStatus,
  selectedWorkOrderId,
  replyContent,
  replyError,
  statusOptions,
  isLoading,
  list,
  totalRow,
  totalPages,
  selectedWorkOrder,
  workOrderDetailQuery,
  isChatConnected,
  closeMutation,
  confirmDialog,
  openDetail,
  closeDetail,
  submitReply,
  requestClose,
  closeConfirm,
  handleConfirm,
} = useAdminWorkOrderListPage()

const columns = createWorkOrderColumns({ openDetail, requestClose })
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
    title="工单管理"
    :show-create-button="false"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
    @row-click="openDetail"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="searchStatus">
          <SelectTrigger class="h-8 w-28" aria-label="筛选工单状态">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </template>
  </DataTableCrud>

  <WorkOrderDetailDialog
    v-if="selectedWorkOrderId"
    v-model:reply-content="replyContent"
    :open="!!selectedWorkOrderId"
    :work-order="selectedWorkOrder"
    :is-loading="workOrderDetailQuery.isLoading.value"
    :is-closing="closeMutation.isPending.value"
    :is-connected="isChatConnected"
    :reply-error="replyError"
    @close="closeDetail"
    @reply="submitReply"
    @close-work-order="requestClose()"
  />

  <ConfirmDialog
    :open="confirmDialog.open"
    :title="confirmDialog.title"
    :description="confirmDialog.description"
    :confirm-text="confirmDialog.confirmText"
    :confirm-variant="confirmDialog.confirmVariant"
    :loading="confirmDialog.isProcessing"
    @close="closeConfirm"
    @confirm="handleConfirm"
  />
</template>
