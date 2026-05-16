<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/common/ui/dropdown-menu'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { formatDateTime, formatDateTimeRange, formatPrice } from '@/utils/format'
import type { SessionVO, TicketInventoryVO, TicketTypeVO } from '@/api/event'
import { useSessionList } from '@/composables/admin'
import SessionDialog from './SessionDialog.vue'

const props = defineProps<{
  eventId: string
  sessions: SessionVO[] | undefined
  ticketInventories?: Record<string, TicketInventoryVO>
}>()

const emit = defineEmits<{
  updated: []
  'create-ticket-type': [sessionId: string]
  'edit-ticket-type': [ticketType: TicketTypeVO]
  'adjust-inventory': [ticketType: TicketTypeVO]
  'delete-ticket-type': [ticketType: TicketTypeVO]
  'copy-ticket-types': [session: SessionVO]
}>()

const {
  confirmDialog,
  showSessionDialog,
  editingSessionId,
  sessionError,
  sessionForm,
  batchSessionRows,
  batchAddSessionsMutation,
  updateSessionMutation,
  addBatchRow,
  removeBatchRow,
  openSessionCreate,
  openSessionEdit,
  handleSaveSession,
  handleDeleteSession,
  closeConfirm,
  handleConfirm,
} = useSessionList({
  eventId: () => props.eventId,
  onUpdated: () => emit('updated'),
})

const isSavingSession = computed(
  () => batchAddSessionsMutation.isPending.value || updateSessionMutation.isPending.value,
)

const handleUpdateSessionForm = (form: { name: string; startAt?: string; endAt?: string }) => {
  Object.assign(sessionForm, form)
}

const handleUpdateBatchRows = (rows: { name: string; startAt: string; endAt: string }[]) => {
  batchSessionRows.value = rows
}

const getAvailableStock = (ticketType: TicketTypeVO) => {
  const inventory = getTicketInventory(ticketType)
  if (!inventory) return undefined
  return Math.max(inventory.totalQty - inventory.lockedQty - inventory.soldQty, 0)
}

const getTicketInventory = (ticketType: TicketTypeVO) =>
  props.ticketInventories?.[ticketType.id] ?? ticketType.inventory

const formatTicketPrice = (ticketType: TicketTypeVO) =>
  ticketType.salePrice == null ? '-' : formatPrice(ticketType.salePrice)

const formatTicketSaleWindow = (ticketType: TicketTypeVO) =>
  formatDateTimeRange(ticketType.saleStartAt, ticketType.saleEndAt) || '-'
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold">场次与票种</h3>
      <Button @click="openSessionCreate">添加场次</Button>
    </div>

    <!-- Empty -->
    <EmptyState
      v-if="!sessions || sessions.length === 0"
      class="min-h-40 rounded-lg border border-border"
      title="暂无场次"
      description="点击右上角添加场次后再配置票种。"
    />

    <!-- Session Cards -->
    <div v-else class="space-y-3">
      <Card v-for="session in sessions" :key="session.id">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <CardTitle class="text-base">{{ session.name }}</CardTitle>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ formatDateTime(session.startAt, '-') }} —
                {{ formatDateTime(session.endAt, '-') }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <Button
                v-if="session.ticketTypes && session.ticketTypes.length > 0"
                variant="outline"
                size="sm"
                @click="emit('create-ticket-type', session.id)"
              >
                + 添加票种
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 text-muted-foreground"
                    aria-label="打开场次操作菜单"
                    >···</Button
                  >
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openSessionEdit(session)">编辑场次</DropdownMenuItem>
                  <DropdownMenuItem @click="emit('copy-ticket-types', session)"
                    >复制票种到其他场次</DropdownMenuItem
                  >
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click="handleDeleteSession(session)"
                  >
                    删除场次
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            v-if="!session.ticketTypes || session.ticketTypes.length === 0"
            variant="outline"
            class="w-full border-dashed"
            @click="emit('create-ticket-type', session.id)"
          >
            + 新增票种
          </Button>
          <div v-else class="space-y-2">
            <div
              v-for="tt in session.ticketTypes"
              :key="tt.id"
              class="flex flex-col gap-3 rounded-md bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0 space-y-2">
                <div class="font-medium text-sm">{{ tt.name }}</div>
                <div
                  class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
                >
                  <span>售价 {{ formatTicketPrice(tt) }}</span>
                  <span>售卖 {{ formatTicketSaleWindow(tt) }}</span>
                </div>
                <div v-if="getTicketInventory(tt)" class="flex flex-wrap gap-1.5 text-xs">
                  <Badge variant="outline">总库存 {{ getTicketInventory(tt)?.totalQty }}</Badge>
                  <Badge variant="outline">可售 {{ getAvailableStock(tt) }}</Badge>
                  <Badge variant="outline">已售 {{ getTicketInventory(tt)?.soldQty }}</Badge>
                  <Badge variant="outline">锁定 {{ getTicketInventory(tt)?.lockedQty }}</Badge>
                </div>
                <p v-else class="text-xs text-muted-foreground">库存未配置</p>
              </div>
              <div class="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" size="sm" @click="emit('edit-ticket-type', tt)"
                  >编辑</Button
                >
                <Button variant="outline" size="sm" @click="emit('adjust-inventory', tt)"
                  >调整库存</Button
                >
                <Button variant="outline" size="sm" @click="emit('delete-ticket-type', tt)">
                  删除
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <SessionDialog
    v-model:open="showSessionDialog"
    :editing-session-id="editingSessionId"
    :session-error="sessionError"
    :session-form="sessionForm"
    :batch-session-rows="batchSessionRows"
    :is-saving="isSavingSession"
    @update:session-form="handleUpdateSessionForm"
    @update:batch-session-rows="handleUpdateBatchRows"
    @save="handleSaveSession"
    @add-batch-row="addBatchRow"
    @remove-batch-row="removeBatchRow"
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
