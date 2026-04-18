<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/common/ui/dropdown-menu'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import {
  batchAddSessions,
  updateSession,
  deleteSession,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  adjustTicketTypeInventory,
  copyTicketTypes,
} from '@/api/event/event'
import { formatDateTime, formatDateTimeLocalInput } from '@/utils/format'
import DateTimePicker from '@/components/common/DateTimePicker.vue'
import type {
  SessionVO,
  SessionItem,
  SessionUpdateRequest,
  TicketTypeVO,
  TicketTypeCreateRequest,
  TicketTypeUpdateRequest,
  TicketTypeInventoryAdjustRequest,
} from '@/api/event'

interface Props {
  eventId: string
  sessions: SessionVO[] | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

// ─── Confirm Dialog ───────────────────────────────────────

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => {
  confirmDialog.value.open = false
}
const handleConfirm = () => {
  confirmDialog.value.onConfirm()
  closeConfirm()
}

// ─── Session ──────────────────────────────────────────────

const showSessionDialog = ref(false)
const editingSessionId = ref<string | null>(null)

const sessionForm = reactive<SessionItem & Partial<SessionUpdateRequest>>({
  name: '',
  startAt: '',
  endAt: '',
})

const batchSessionRows = ref<Array<{ name: string; startAt: string; endAt: string }>>([
  { name: '', startAt: '', endAt: '' },
])

const addBatchRow = () => {
  batchSessionRows.value.push({ name: '', startAt: '', endAt: '' })
}

const removeBatchRow = (idx: number) => {
  if (batchSessionRows.value.length > 1) {
    batchSessionRows.value.splice(idx, 1)
  }
}

const openSessionCreate = () => {
  batchSessionRows.value = [{ name: '', startAt: '', endAt: '' }]
  editingSessionId.value = null
  showSessionDialog.value = true
}

const openSessionEdit = (session: SessionVO) => {
  sessionForm.name = session.name
  sessionForm.startAt = formatDateTimeLocalInput(session.startAt!)
  sessionForm.endAt = formatDateTimeLocalInput(session.endAt!)
  editingSessionId.value = session.id
  showSessionDialog.value = true
}

const batchAddSessionsMutation = useMutation({
  mutationFn: (sessions: SessionItem[]) => batchAddSessions(props.eventId, { sessions }),
  onSuccess: () => {
    toast.success('场次添加成功')
    showSessionDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('添加失败')
  },
})

const updateSessionMutation = useMutation({
  mutationFn: ({ sessionId, data }: { sessionId: string; data: SessionUpdateRequest }) =>
    updateSession(props.eventId, sessionId, data),
  onSuccess: () => {
    toast.success('场次更新成功')
    showSessionDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('更新失败')
  },
})

const deleteSessionMutation = useMutation({
  mutationFn: (sessionId: string) => deleteSession(props.eventId, sessionId),
  onSuccess: () => {
    toast.success('场次删除成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('删除失败')
  },
})

const handleSaveSession = async () => {
  if (editingSessionId.value) {
    if (!sessionForm.name) {
      toast.error('请填写场次名称')
      return
    }
    await updateSessionMutation.mutateAsync({
      sessionId: editingSessionId.value,
      data: sessionForm,
    })
  } else {
    const validRows = batchSessionRows.value.filter((r) => r.name)
    if (validRows.length === 0) {
      toast.error('请至少填写一个场次名称')
      return
    }
    await batchAddSessionsMutation.mutateAsync(validRows)
  }
}

const handleDeleteSession = (session: SessionVO) => {
  openConfirm('确认删除', `确认删除场次「${session.name}」？`, () =>
    deleteSessionMutation.mutate(session.id),
  )
}

// ─── Ticket Type ──────────────────────────────────────────

const showTicketTypeDialog = ref(false)
const editingTicketTypeId = ref<string | null>(null)
const activeSessionId = ref<string | null>(null)
const showInventoryDialog = ref(false)
const inventoryTicketTypeId = ref<string | null>(null)
const adjustQty = ref(0)

const ticketTypeForm = reactive<TicketTypeCreateRequest & Partial<TicketTypeUpdateRequest>>({
  name: '',
  salePrice: 0,
  orderLimit: 1,
  accountLimit: 1,
  saleStartAt: '',
  saleEndAt: '',
  totalQty: 0,
})

const resetTicketTypeForm = () => {
  ticketTypeForm.name = ''
  ticketTypeForm.salePrice = 0
  ticketTypeForm.orderLimit = 1
  ticketTypeForm.accountLimit = 1
  ticketTypeForm.saleStartAt = ''
  ticketTypeForm.saleEndAt = ''
  ticketTypeForm.totalQty = 0
}

const openTicketTypeCreate = (sessionId: string) => {
  resetTicketTypeForm()
  editingTicketTypeId.value = null
  activeSessionId.value = sessionId
  showTicketTypeDialog.value = true
}

const openTicketTypeEdit = (ticketType: TicketTypeVO) => {
  ticketTypeForm.name = ticketType.name
  ticketTypeForm.salePrice = ticketType.salePrice ?? ticketType.price ?? 0
  ticketTypeForm.orderLimit = ticketType.orderLimit || 1
  ticketTypeForm.accountLimit = ticketType.accountLimit || 1
  ticketTypeForm.saleStartAt = formatDateTimeLocalInput(ticketType.saleStartAt!)
  ticketTypeForm.saleEndAt = formatDateTimeLocalInput(ticketType.saleEndAt!)
  editingTicketTypeId.value = ticketType.id
  showTicketTypeDialog.value = true
}

const openInventoryAdjust = (ticketType: TicketTypeVO) => {
  inventoryTicketTypeId.value = ticketType.id
  adjustQty.value = 0
  showInventoryDialog.value = true
}

const createTicketTypeMutation = useMutation({
  mutationFn: (data: TicketTypeCreateRequest) =>
    activeSessionId.value
      ? createTicketType(props.eventId, activeSessionId.value, data)
      : Promise.reject(new Error('No session ID')),
  onSuccess: () => {
    toast.success('票种创建成功')
    showTicketTypeDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('创建失败')
  },
})

const updateTicketTypeMutation = useMutation({
  mutationFn: ({ ticketTypeId, data }: { ticketTypeId: string; data: TicketTypeUpdateRequest }) =>
    updateTicketType(props.eventId, ticketTypeId, data),
  onSuccess: () => {
    toast.success('票种更新成功')
    showTicketTypeDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('更新失败')
  },
})

const deleteTicketTypeMutation = useMutation({
  mutationFn: (ticketTypeId: string) => deleteTicketType(props.eventId, ticketTypeId),
  onSuccess: () => {
    toast.success('票种删除成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('删除失败')
  },
})

const adjustInventoryMutation = useMutation({
  mutationFn: ({
    ticketTypeId,
    data,
  }: {
    ticketTypeId: string
    data: TicketTypeInventoryAdjustRequest
  }) => adjustTicketTypeInventory(props.eventId, ticketTypeId, data),
  onSuccess: () => {
    toast.success('库存调整成功')
    showInventoryDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('调整失败')
  },
})

const handleSaveTicketType = async () => {
  if (!ticketTypeForm.name || ticketTypeForm.salePrice <= 0) {
    toast.error('请填写完整信息')
    return
  }
  if (!editingTicketTypeId.value && ticketTypeForm.totalQty <= 0) {
    toast.error('请填写总库存')
    return
  }
  if (editingTicketTypeId.value) {
    await updateTicketTypeMutation.mutateAsync({
      ticketTypeId: editingTicketTypeId.value,
      data: ticketTypeForm,
    })
  } else {
    await createTicketTypeMutation.mutateAsync(ticketTypeForm as TicketTypeCreateRequest)
  }
}

const handleDeleteTicketType = (ticketType: TicketTypeVO) => {
  openConfirm('确认删除', `确认删除票种「${ticketType.name}」？`, () =>
    deleteTicketTypeMutation.mutate(ticketType.id),
  )
}

const handleAdjustInventory = async () => {
  if (!inventoryTicketTypeId.value || adjustQty.value === 0) {
    toast.error('请输入调整数量')
    return
  }
  await adjustInventoryMutation.mutateAsync({
    ticketTypeId: inventoryTicketTypeId.value,
    data: { adjustQty: adjustQty.value },
  })
}

// ─── Copy Ticket Types ────────────────────────────────────

const showCopyDialog = ref(false)
const copySourceSession = ref<SessionVO | null>(null)
const copyTargetSessionIds = ref<string[]>([])

const openCopyDialog = (session: SessionVO) => {
  copySourceSession.value = session
  copyTargetSessionIds.value = []
  showCopyDialog.value = true
}

const toggleCopyTarget = (sessionId: string) => {
  const idx = copyTargetSessionIds.value.indexOf(sessionId)
  if (idx === -1) {
    copyTargetSessionIds.value.push(sessionId)
  } else {
    copyTargetSessionIds.value.splice(idx, 1)
  }
}

const copyTicketTypesMutation = useMutation({
  mutationFn: ({
    sourceSessionId,
    targetSessionIds,
  }: {
    sourceSessionId: string
    targetSessionIds: string[]
  }) => copyTicketTypes(props.eventId, { sourceSessionId, targetSessionIds }),
  onSuccess: () => {
    toast.success('票种复制成功')
    showCopyDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('复制失败')
  },
})

const handleCopyTicketTypes = async () => {
  if (!copySourceSession.value) return
  if (copyTargetSessionIds.value.length === 0) {
    toast.error('请选择目标场次')
    return
  }
  await copyTicketTypesMutation.mutateAsync({
    sourceSessionId: copySourceSession.value.id,
    targetSessionIds: copyTargetSessionIds.value,
  })
}

// ─── Format Helpers ───────────────────────────────────────

const formatPrice = (price: number) => `¥${(price / 100).toFixed(2)}`
const getTicketTypePrice = (tt: TicketTypeVO) => tt.salePrice ?? tt.price ?? 0
const getTotalQty = (tt: TicketTypeVO) => tt.inventory?.totalQty ?? 0
const getAvailableQty = (tt: TicketTypeVO) => {
  const total = tt.inventory?.totalQty ?? 0
  const locked = tt.inventory?.lockedQty ?? 0
  const sold = tt.inventory?.soldQty ?? 0
  return total - locked - sold
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold">场次与票种</h3>
      <Button @click="openSessionCreate">添加场次</Button>
    </div>

    <!-- Empty -->
    <div
      v-if="!sessions || sessions.length === 0"
      class="text-center py-10 text-muted-foreground border rounded-lg"
    >
      暂无场次，点击右上角添加
    </div>

    <!-- Session Cards -->
    <div v-else class="space-y-3">
      <Card v-for="session in sessions" :key="session.id">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <CardTitle class="text-base">{{ session.name }}</CardTitle>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ formatDateTime(session.startAt!) }} — {{ formatDateTime(session.endAt!) }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <Button
                v-if="session.ticketTypes && session.ticketTypes.length > 0"
                variant="outline"
                size="sm"
                @click="openTicketTypeCreate(session.id)"
              >
                + 添加票种
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-muted-foreground"
                    >···</Button
                  >
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openSessionEdit(session)">编辑场次</DropdownMenuItem>
                  <DropdownMenuItem @click="openCopyDialog(session)"
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
          <button
            v-if="!session.ticketTypes || session.ticketTypes.length === 0"
            class="w-full text-sm text-muted-foreground text-center py-5 border border-dashed rounded-md hover:border-primary hover:text-primary transition-colors cursor-pointer"
            @click="openTicketTypeCreate(session.id)"
          >
            + 新增票种
          </button>
          <div v-else class="space-y-2">
            <div
              v-for="tt in session.ticketTypes"
              :key="tt.id"
              class="flex items-center justify-between p-3 bg-muted/40 rounded-md"
            >
              <div>
                <div class="font-medium text-sm">{{ tt.name }}</div>
                <div class="text-xs text-muted-foreground mt-0.5">
                  {{ formatPrice(getTicketTypePrice(tt)) }} · 库存 {{ getTotalQty(tt) }} · 可用
                  {{ getAvailableQty(tt) }}
                </div>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="openTicketTypeEdit(tt)">编辑</Button>
                <Button variant="outline" size="sm" @click="openInventoryAdjust(tt)"
                  >调整库存</Button
                >
                <Button
                  variant="outline"
                  size="sm"
                  class="text-muted-foreground hover:text-destructive hover:border-destructive/40"
                  @click="handleDeleteTicketType(tt)"
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Session Dialog -->
  <Dialog :open="showSessionDialog" @update:open="(v) => !v && (showSessionDialog = false)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ editingSessionId ? '编辑场次' : '批量添加场次' }}</DialogTitle>
      </DialogHeader>

      <!-- Edit mode: single row form -->
      <div v-if="editingSessionId" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>场次名称 <span class="text-destructive">*</span></Label>
          <Input v-model="sessionForm.name" placeholder="请输入场次名称" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>开始时间</Label>
            <DateTimePicker v-model="sessionForm.startAt" placeholder="选择开始时间" />
          </div>
          <div class="grid gap-2">
            <Label>结束时间</Label>
            <DateTimePicker v-model="sessionForm.endAt" placeholder="选择结束时间" />
          </div>
        </div>
      </div>

      <!-- Create mode: batch rows -->
      <div v-else class="py-4 space-y-3">
        <div
          v-for="(row, idx) in batchSessionRows"
          :key="idx"
          class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end"
        >
          <div class="grid gap-1">
            <Label v-if="idx === 0">场次名称 <span class="text-destructive">*</span></Label>
            <Input v-model="row.name" placeholder="请输入场次名称" />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0">开始时间</Label>
            <Input v-model="row.startAt" type="datetime-local" />
          </div>
          <div class="grid gap-1">
            <Label v-if="idx === 0">结束时间</Label>
            <Input v-model="row.endAt" type="datetime-local" />
          </div>
          <Button
            variant="outline"
            size="sm"
            class="text-destructive hover:text-destructive"
            :disabled="batchSessionRows.length <= 1"
            @click="removeBatchRow(idx)"
          >
            删除
          </Button>
        </div>
        <Button variant="outline" size="sm" @click="addBatchRow">+ 添加一行</Button>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showSessionDialog = false">取消</Button>
        <Button @click="handleSaveSession">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Ticket Type Dialog -->
  <Dialog :open="showTicketTypeDialog" @update:open="(v) => !v && (showTicketTypeDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ editingTicketTypeId ? '编辑票种' : '添加票种' }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>票种名称 <span class="text-destructive">*</span></Label>
          <Input v-model="ticketTypeForm.name" placeholder="请输入票种名称" />
        </div>
        <div class="grid gap-2">
          <Label>售价（分） <span class="text-destructive">*</span></Label>
          <Input
            v-model.number="ticketTypeForm.salePrice"
            type="number"
            placeholder="请输入售价（单位：分）"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>每单限购</Label>
            <Input
              v-model.number="ticketTypeForm.orderLimit"
              type="number"
              placeholder="每单限购数量"
            />
          </div>
          <div class="grid gap-2">
            <Label>每人限购</Label>
            <Input
              v-model.number="ticketTypeForm.accountLimit"
              type="number"
              placeholder="每人限购数量"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>售卖开始时间</Label>
            <DateTimePicker v-model="ticketTypeForm.saleStartAt" placeholder="选择开始时间" />
          </div>
          <div class="grid gap-2">
            <Label>售卖结束时间</Label>
            <DateTimePicker v-model="ticketTypeForm.saleEndAt" placeholder="选择结束时间" />
          </div>
        </div>
        <div v-if="!editingTicketTypeId" class="grid gap-2">
          <Label>总库存 <span class="text-destructive">*</span></Label>
          <Input
            v-model.number="ticketTypeForm.totalQty"
            type="number"
            placeholder="请输入总库存"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showTicketTypeDialog = false">取消</Button>
        <Button @click="handleSaveTicketType">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Inventory Dialog -->
  <Dialog :open="showInventoryDialog" @update:open="(v) => !v && (showInventoryDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>调整库存</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>调整数量（正数增加，负数减少）</Label>
          <Input v-model.number="adjustQty" type="number" placeholder="请输入调整数量" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showInventoryDialog = false">取消</Button>
        <Button @click="handleAdjustInventory">调整</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Copy Ticket Types Dialog -->
  <Dialog :open="showCopyDialog" @update:open="(v) => !v && (showCopyDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>复制票种到其他场次</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="text-sm text-muted-foreground">
          源场次：<span class="font-medium text-foreground">{{ copySourceSession?.name }}</span>
        </div>
        <div class="grid gap-2">
          <Label>选择目标场次</Label>
          <div class="space-y-2">
            <div
              v-for="session in sessions?.filter((s) => s.id !== copySourceSession?.id)"
              :key="session.id"
              class="flex items-center gap-2 cursor-pointer"
              @click="toggleCopyTarget(session.id)"
            >
              <input
                type="checkbox"
                :checked="copyTargetSessionIds.includes(session.id)"
                class="h-4 w-4 cursor-pointer"
                @click.stop="toggleCopyTarget(session.id)"
              />
              <span class="text-sm">{{ session.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showCopyDialog = false">取消</Button>
        <Button @click="handleCopyTicketTypes">确认复制</Button>
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
