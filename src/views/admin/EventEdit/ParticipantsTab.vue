<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import { Checkbox } from '@/components/common/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { Input } from '@/components/common/ui/input'
import { fetchAdminParticipantsPage } from '@/api/event/participant'
import { batchAddParticipants, removeParticipant } from '@/api/event/event'
import type { EventParticipantVO, EventParticipantBatchAddRequest } from '@/api/event'

interface Props {
  eventId: string
  eventParticipants: EventParticipantVO[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

// ─── Dialog State ─────────────────────────────────────────

const showParticipantDialog = ref(false)
const participantSearchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedParticipantIds = ref<string[]>([])

// Reset to page 1 when search changes
watch(participantSearchQuery, () => {
  currentPage.value = 1
})

const { data: pageData, isFetching } = useQuery({
  queryKey: ['admin-participants-page', participantSearchQuery, currentPage],
  queryFn: () =>
    fetchAdminParticipantsPage({
      page: currentPage.value,
      size: pageSize,
      name: participantSearchQuery.value || undefined,
    }),
  enabled: showParticipantDialog,
})

const openParticipantDialog = () => {
  selectedParticipantIds.value = props.eventParticipants.map((p) => p.participant.id)
  participantSearchQuery.value = ''
  currentPage.value = 1
  showParticipantDialog.value = true
}

// ─── Mutations ────────────────────────────────────────────

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const batchAddParticipantsMutation = useMutation({
  mutationFn: (data: EventParticipantBatchAddRequest) => batchAddParticipants(props.eventId, data),
  onSuccess: () => {
    toast.success('参与方添加成功')
    showParticipantDialog.value = false
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('添加失败')
  },
})

const removeParticipantMutation = useMutation({
  mutationFn: (eventParticipantId: string) => removeParticipant(props.eventId, eventParticipantId),
  onSuccess: () => {
    toast.success('参与方移除成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('移除失败')
  },
})

// ─── Handlers ─────────────────────────────────────────────

const handleAddParticipants = async () => {
  const newParticipantIds = selectedParticipantIds.value.filter(
    (id) => !props.eventParticipants.some((p) => p.participant.id === id),
  )
  if (newParticipantIds.length > 0) {
    await batchAddParticipantsMutation.mutateAsync({
      participantIds: newParticipantIds.map((id) => parseInt(id)),
    })
  } else {
    showParticipantDialog.value = false
  }
}

const handleRemoveParticipant = (eventParticipant: EventParticipantVO) => {
  openConfirm('确认移除', `确认移除参与方「${eventParticipant.participant.name}」？`, () =>
    removeParticipantMutation.mutate(eventParticipant.id),
  )
}

const toggleParticipant = (participantId: string) => {
  const index = selectedParticipantIds.value.indexOf(participantId)
  if (index > -1) {
    selectedParticipantIds.value.splice(index, 1)
  } else {
    selectedParticipantIds.value.push(participantId)
  }
}

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
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>参与方</CardTitle>
        <Button @click="openParticipantDialog">添加参与方</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="eventParticipants.length === 0" class="text-center py-4 text-muted-foreground">
        暂无参与方
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="participant in eventParticipants"
          :key="participant.id"
          class="flex items-center justify-between p-3 border rounded-lg"
        >
          <div class="flex items-center gap-3">
            <img
              :src="participant.participant.avatarUrl"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div class="font-medium">{{ participant.participant.name }}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-destructive"
            @click="handleRemoveParticipant(participant)"
          >
            移除
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <Dialog :open="showParticipantDialog" @update:open="(v) => !v && (showParticipantDialog = false)">
    <DialogContent class="max-w-2xl">
      <DialogHeader class="pb-4">
        <DialogTitle class="text-lg font-semibold">选择参与方</DialogTitle>
      </DialogHeader>

      <!-- Search -->
      <div class="pb-3">
        <Input v-model="participantSearchQuery" placeholder="搜索参与方..." class="w-full" />
      </div>

      <!-- List -->
      <div class="min-h-50 max-h-[50vh] overflow-y-auto pr-1">
        <div
          v-if="isFetching"
          class="flex items-center justify-center py-12 text-muted-foreground text-sm"
        >
          加载中...
        </div>
        <div
          v-else-if="!pageData?.records || pageData.records.length === 0"
          class="text-center py-12 text-muted-foreground"
        >
          {{ participantSearchQuery ? '未找到匹配的参与方' : '暂无可用参与方' }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="participant in pageData.records"
            :key="participant.id"
            class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/40"
            @click="toggleParticipant(participant.id)"
          >
            <Checkbox
              :checked="selectedParticipantIds.includes(participant.id)"
              @update:checked="() => toggleParticipant(participant.id)"
              @click.stop
            />
            <img :src="participant.avatarUrl" class="w-9 h-9 rounded-full object-cover" />
            <Label class="font-medium cursor-pointer">{{ participant.name }}</Label>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pageData && pageData.totalPage > 1"
        class="flex items-center justify-between pt-3 border-t text-sm text-muted-foreground"
      >
        <span>共 {{ pageData.totalRow }} 条</span>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--">
            上一页
          </Button>
          <span>{{ currentPage }} / {{ pageData.totalPage }}</span>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= pageData.totalPage"
            @click="currentPage++"
          >
            下一页
          </Button>
        </div>
      </div>

      <DialogFooter class="pt-4">
        <Button variant="outline" @click="showParticipantDialog = false">取消</Button>
        <Button
          :disabled="batchAddParticipantsMutation.isPending.value"
          @click="handleAddParticipants"
        >
          {{ batchAddParticipantsMutation.isPending.value ? '添加中...' : '添加' }}
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
