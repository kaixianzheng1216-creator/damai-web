<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Label } from '@/components/common/ui/label'
import { Checkbox } from '@/components/common/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { Input } from '@/components/common/ui/input'
import type { EventParticipantVO } from '@/api/event'
import { useEventParticipantsTab } from '@/composables/admin'

const props = defineProps<{
  eventId: string
  eventParticipants: EventParticipantVO[]
}>()

const emit = defineEmits<{
  updated: []
}>()

const {
  confirmDialog,
  showParticipantDialog,
  participantSearchQuery,
  currentPage,
  selectedParticipantIds,
  pageData,
  isFetching,
  batchAddParticipantsMutation,
  openParticipantDialog,
  handleAddParticipants,
  handleRemoveParticipant,
  toggleParticipant,
  closeConfirm,
  handleConfirm,
} = useEventParticipantsTab({
  eventId: () => props.eventId,
  eventParticipants: () => props.eventParticipants,
  onUpdated: () => emit('updated'),
})

const isAddingParticipants = computed(() => batchAddParticipantsMutation.isPending.value)

const handleParticipantDialogOpenChange = (value: boolean) => {
  if (!value && !isAddingParticipants.value) {
    showParticipantDialog.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>参与方</CardTitle>
        <Button type="button" @click="openParticipantDialog">添加参与方</Button>
      </div>
    </CardHeader>
    <CardContent>
      <EmptyState v-if="eventParticipants.length === 0" class="min-h-32" title="暂无参与方" />
      <div v-else class="space-y-3">
        <div
          v-for="participant in eventParticipants"
          :key="participant.id"
          class="flex items-center justify-between p-3 border rounded-lg"
        >
          <div class="flex items-center gap-3">
            <img
              :src="participant.participant.avatarUrl"
              alt="参与者头像"
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

  <Dialog :open="showParticipantDialog" @update:open="handleParticipantDialogOpenChange">
    <DialogContent
      class="w-[calc(100vw-2rem)] max-w-2xl sm:max-w-2xl"
      :show-close-button="!isAddingParticipants"
    >
      <DialogHeader class="pb-4">
        <DialogTitle class="text-lg font-semibold">选择参与方</DialogTitle>
        <DialogDescription>勾选参与本活动的艺人、球队或主办方。</DialogDescription>
      </DialogHeader>

      <!-- Search -->
      <div class="pb-3">
        <Input
          v-model="participantSearchQuery"
          placeholder="搜索参与方..."
          class="w-full"
          aria-label="搜索参与方"
        />
      </div>

      <!-- List -->
      <div class="min-h-50 max-h-[50vh] overflow-y-auto pr-1">
        <div v-if="isFetching" class="flex-center py-12 text-muted-sm">加载中...</div>
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
              :id="`participant-option-${participant.id}`"
              :checked="selectedParticipantIds.includes(participant.id)"
              :aria-label="`选择参与方 ${participant.name}`"
              @update:checked="() => toggleParticipant(participant.id)"
              @click.stop
            />
            <img
              :src="participant.avatarUrl"
              alt="参与者封面"
              class="w-9 h-9 rounded-full object-cover"
            />
            <Label
              :for="`participant-option-${participant.id}`"
              class="font-medium cursor-pointer"
              @click.stop
              >{{ participant.name }}</Label
            >
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
        <Button
          type="button"
          variant="outline"
          :disabled="isAddingParticipants"
          @click="handleParticipantDialogOpenChange(false)"
        >
          取消
        </Button>
        <Button type="button" :disabled="isAddingParticipants" @click="handleAddParticipants">
          {{ isAddingParticipants ? '添加中...' : '添加' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

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
