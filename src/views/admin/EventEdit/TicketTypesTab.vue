<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/common/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import {
  createTicketType,
  updateTicketType,
  deleteTicketType,
  adjustTicketTypeInventory,
} from '@/api/event/event'
import { formatDateTimeLocalInput } from '@/utils/format'
import type {
  SessionVO,
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

const selectedSessionId = ref<string | null>(null)
const showTicketTypeDialog = ref(false)
const editingTicketTypeId = ref<string | null>(null)
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

const ticketTypesData = computed(() => {
  if (!selectedSessionId.value || !props.sessions) return undefined
  const session = props.sessions.find((s) => s.id === selectedSessionId.value)
  return session?.ticketTypes
})

watch(() => props.sessions, (newSessions) => {
  if (newSessions && newSessions.length > 0 && !selectedSessionId.value) {
    selectedSessionId.value = newSessions[0]!.id
  }
}, { immediate: true })

const resetTicketTypeForm = () => {
  ticketTypeForm.name = ''
  ticketTypeForm.salePrice = 0
  ticketTypeForm.orderLimit = 1
  ticketTypeForm.accountLimit = 1
  ticketTypeForm.saleStartAt = ''
  ticketTypeForm.saleEndAt = ''
  ticketTypeForm.totalQty = 0
}

const openTicketTypeCreate = () => {
  if (!selectedSessionId.value) {
    toast.error('请先选择一个场次')
    return
  }
  resetTicketTypeForm()
  editingTicketTypeId.value = null
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

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const createTicketTypeMutation = useMutation({
  mutationFn: (data: TicketTypeCreateRequest) =>
    selectedSessionId.value ? createTicketType(props.eventId, selectedSessionId.value, data) : Promise.reject(new Error('No session ID')),
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
  mutationFn: ({ ticketTypeId, data }: { ticketTypeId: string; data: TicketTypeInventoryAdjustRequest }) =>
    adjustTicketTypeInventory(props.eventId, ticketTypeId, data),
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
    await updateTicketTypeMutation.mutateAsync({ ticketTypeId: editingTicketTypeId.value, data: ticketTypeForm })
  } else {
    await createTicketTypeMutation.mutateAsync(ticketTypeForm as TicketTypeCreateRequest)
  }
}

const handleDeleteTicketType = (ticketType: TicketTypeVO) => {
  openConfirm('确认删除', `确认删除票种「${ticketType.name}」？`, () => deleteTicketTypeMutation.mutate(ticketType.id))
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }

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

const formatPrice = (price: number) => {
  return `¥${(price / 100).toFixed(2)}`
}

const getTicketTypePrice = (ticketType: TicketTypeVO) => {
  return ticketType.salePrice ?? ticketType.price ?? 0
}

const getTotalQty = (ticketType: TicketTypeVO) => {
  return ticketType.inventory?.totalQty ?? 0
}

const getAvailableQty = (ticketType: TicketTypeVO) => {
  const total = ticketType.inventory?.totalQty ?? 0
  const locked = ticketType.inventory?.lockedQty ?? 0
  const sold = ticketType.inventory?.soldQty ?? 0
  return total - locked - sold
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>票种管理</CardTitle>
        <Button @click="openTicketTypeCreate">添加票种</Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label>选择场次</Label>
        <Select :model-value="selectedSessionId" @update:model-value="(v) => (selectedSessionId = v as string | null)">
          <SelectTrigger>
            <SelectValue placeholder="请选择场次" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="session in sessions" :key="session.id" :value="session.id">
              {{ session.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="!ticketTypesData || ticketTypesData.length === 0" class="text-center py-4 text-muted-foreground">
        暂无票种
      </div>
      <div v-else class="space-y-3">
        <div v-for="ticketType in ticketTypesData" :key="ticketType.id" class="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div class="font-medium">{{ ticketType.name }}</div>
            <div class="text-sm text-muted-foreground">
              {{ formatPrice(getTicketTypePrice(ticketType)) }} | 库存: {{ getTotalQty(ticketType) }} | 可用: {{ getAvailableQty(ticketType) }}
            </div>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="openInventoryAdjust(ticketType)">调整库存</Button>
            <Button variant="outline" size="sm" @click="openTicketTypeEdit(ticketType)">编辑</Button>
            <Button size="sm" @click="handleDeleteTicketType(ticketType)">删除</Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

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
          <Input v-model.number="ticketTypeForm.salePrice" type="number" placeholder="请输入售价（单位：分）" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>每单限购</Label>
            <Input v-model.number="ticketTypeForm.orderLimit" type="number" placeholder="每单限购数量" />
          </div>
          <div class="grid gap-2">
            <Label>每人限购</Label>
            <Input v-model.number="ticketTypeForm.accountLimit" type="number" placeholder="每人限购数量" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>售卖开始时间</Label>
            <Input v-model="ticketTypeForm.saleStartAt" type="datetime-local" />
          </div>
          <div class="grid gap-2">
            <Label>售卖结束时间</Label>
            <Input v-model="ticketTypeForm.saleEndAt" type="datetime-local" />
          </div>
        </div>
        <div v-if="!editingTicketTypeId" class="grid gap-2">
          <Label>总库存 <span class="text-destructive">*</span></Label>
          <Input v-model.number="ticketTypeForm.totalQty" type="number" placeholder="请输入总库存" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showTicketTypeDialog = false">取消</Button>
        <Button @click="handleSaveTicketType">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

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

  <ConfirmDialog :open="confirmDialog.open" :title="confirmDialog.title"
    :description="confirmDialog.description" @close="closeConfirm" @confirm="handleConfirm" />
</template>

