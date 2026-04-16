<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { fetchAdminParticipants } from '@/api/event/participant'
import { batchAddParticipants, removeParticipant } from '@/api/event/event'
import type { EventParticipantVO, EventParticipantBatchAddRequest, ParticipantVO } from '@/api/event'

interface Props {
  eventId: string
  eventParticipants: EventParticipantVO[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

const { data: participantsData } = useQuery<ParticipantVO[]>({
  queryKey: ['admin-participants'],
  queryFn: fetchAdminParticipants,
})

const showParticipantDialog = ref(false)
const participantSearchQuery = ref('')
const selectedParticipantIds = ref<string[]>([])

const openParticipantDialog = () => {
  selectedParticipantIds.value = props.eventParticipants.map(p => p.participant.id)
  showParticipantDialog.value = true
}

const filteredParticipants = computed(() => {
  if (!participantsData.value || !participantSearchQuery.value) {
    return participantsData.value
  }
  return participantsData.value.filter((participant: ParticipantVO) =>
    participant.name.toLowerCase().includes(participantSearchQuery.value.toLowerCase())
  )
})

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

const handleAddParticipants = async () => {
  const newParticipantIds = selectedParticipantIds.value.filter(
    id => !props.eventParticipants.some(p => p.participant.id === id),
  )
  if (newParticipantIds.length > 0) {
    await batchAddParticipantsMutation.mutateAsync({
      participantIds: newParticipantIds.map(id => parseInt(id)),
    })
  } else {
    showParticipantDialog.value = false
  }
}

const handleRemoveParticipant = (eventParticipant: EventParticipantVO) => {
  openConfirm('确认移除', `确认移除参与方「${eventParticipant.participant.name}」？`, () => removeParticipantMutation.mutate(eventParticipant.id))
}

const confirmDialog = ref({ open: false, title: '', description: '', onConfirm: () => {} })
const openConfirm = (title: string, description: string, onConfirm: () => void) => {
  confirmDialog.value = { open: true, title, description, onConfirm }
}
const closeConfirm = () => { confirmDialog.value.open = false }
const handleConfirm = () => { confirmDialog.value.onConfirm(); closeConfirm() }

const toggleParticipant = (participantId: string) => {
  const index = selectedParticipantIds.value.indexOf(participantId)
  if (index > -1) {
    selectedParticipantIds.value.splice(index, 1)
  } else {
    selectedParticipantIds.value.push(participantId)
  }
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
        <div v-for="participant in eventParticipants" :key="participant.id" class="flex items-center justify-between p-3 border rounded-lg">
          <div class="flex items-center gap-3">
            <img :src="participant.participant.avatarUrl" class="w-8 h-8 rounded-full object-cover" />
            <div>
              <div class="font-medium">{{ participant.participant.name }}</div>
            </div>
          </div>
          <Button size="sm" @click="handleRemoveParticipant(participant)">移除</Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <Dialog :open="showParticipantDialog" @update:open="(v) => !v && (showParticipantDialog = false)">
    <DialogContent class="max-w-2xl">
      <DialogHeader class="pb-4">
        <DialogTitle class="text-lg font-semibold">选择参与方</DialogTitle>
      </DialogHeader>
      <div class="pb-4">
        <Input
          v-model="participantSearchQuery"
          placeholder="搜索参与方..."
          class="w-full"
        />
      </div>
      <div class="max-h-[60vh] overflow-y-auto pr-1">
        <div v-if="!filteredParticipants || filteredParticipants.length === 0" class="text-center py-12 text-muted-foreground">
          {{ participantSearchQuery ? '未找到匹配的参与方' : '暂无可用参与方' }}
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="participant in filteredParticipants"
            :key="participant.id"
            class="flex items-center gap-3 p-3 border rounded-lg"
          >
            <Checkbox
              :checked="selectedParticipantIds.includes(participant.id)"
              @update:checked="() => toggleParticipant(participant.id)"
            />
            <img :src="participant.avatarUrl" class="w-10 h-10 rounded-full object-cover" />
            <Label class="font-medium cursor-pointer" @click="toggleParticipant(participant.id)">{{ participant.name }}</Label>
          </div>
        </div>
      </div>
      <DialogFooter class="pt-4">
        <Button variant="outline" @click="showParticipantDialog = false">取消</Button>
        <Button :disabled="batchAddParticipantsMutation.isPending.value" @click="handleAddParticipants">
          {{ batchAddParticipantsMutation.isPending.value ? '添加中...' : '添加' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog :open="confirmDialog.open" :title="confirmDialog.title"
    :description="confirmDialog.description" @close="closeConfirm" @confirm="handleConfirm" />
</template>
