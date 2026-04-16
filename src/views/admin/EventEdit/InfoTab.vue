<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { saveEventInfo } from '@/api/event/event'
import type { EventInfoCreateRequest } from '@/api/event'

interface Props {
  eventId: string
  eventInfo?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

const infoForm = reactive<EventInfoCreateRequest>({
  description: '',
  purchaseNotice: [],
  admissionNotice: [],
})

watch(() => props.eventInfo, (newEventInfo) => {
  if (newEventInfo) {
    Object.assign(infoForm, {
      description: newEventInfo.description || '',
      purchaseNotice: newEventInfo.purchaseNotice || [],
      admissionNotice: newEventInfo.admissionNotice || [],
    })
  }
}, { immediate: true })

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
}

const saveEventInfoMutation = useMutation({
  mutationFn: (data: EventInfoCreateRequest) => saveEventInfo(props.eventId, data),
  onSuccess: () => {
    toast.success('详情信息保存成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('保存失败')
  },
})

const handleSaveInfo = async () => {
  await saveEventInfoMutation.mutateAsync(infoForm)
}

const addPurchaseNotice = () => {
  if (!infoForm.purchaseNotice) {
    infoForm.purchaseNotice = []
  }
  infoForm.purchaseNotice.push({ name: '', description: '' })
}

const removePurchaseNotice = (index: number) => {
  if (infoForm.purchaseNotice) {
    infoForm.purchaseNotice.splice(index, 1)
  }
}

const addAdmissionNotice = () => {
  if (!infoForm.admissionNotice) {
    infoForm.admissionNotice = []
  }
  infoForm.admissionNotice.push({ name: '', description: '' })
}

const removeAdmissionNotice = (index: number) => {
  if (infoForm.admissionNotice) {
    infoForm.admissionNotice.splice(index, 1)
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>详情信息</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label>活动描述</Label>
        <Input v-model="infoForm.description" placeholder="请输入活动描述" />
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label>购票须知</Label>
          <Button variant="outline" size="sm" @click="addPurchaseNotice">添加须知</Button>
        </div>
        <div v-if="infoForm.purchaseNotice && infoForm.purchaseNotice.length === 0" class="text-center py-2 text-muted-foreground text-sm">
          暂无购票须知
        </div>
        <div v-else class="space-y-2">
          <div v-for="(notice, index) in infoForm.purchaseNotice" :key="index" class="space-y-2 p-3 border rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">须知 {{ index + 1 }}</span>
              <Button size="sm" @click="removePurchaseNotice(index)">删除</Button>
            </div>
            <Input v-model="notice.name" placeholder="标题" />
            <Input v-model="notice.description" placeholder="描述" />
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label>入场须知</Label>
          <Button variant="outline" size="sm" @click="addAdmissionNotice">添加须知</Button>
        </div>
        <div v-if="infoForm.admissionNotice && infoForm.admissionNotice.length === 0" class="text-center py-2 text-muted-foreground text-sm">
          暂无入场须知
        </div>
        <div v-else class="space-y-2">
          <div v-for="(notice, index) in infoForm.admissionNotice" :key="index" class="space-y-2 p-3 border rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">须知 {{ index + 1 }}</span>
              <Button size="sm" @click="removeAdmissionNotice(index)">删除</Button>
            </div>
            <Input v-model="notice.name" placeholder="标题" />
            <Input v-model="notice.description" placeholder="描述" />
          </div>
        </div>
      </div>
      <Button @click="handleSaveInfo" :disabled="saveEventInfoMutation.isPending.value">
        {{ saveEventInfoMutation.isPending.value ? '保存中...' : '保存' }}
      </Button>
    </CardContent>
  </Card>
</template>

