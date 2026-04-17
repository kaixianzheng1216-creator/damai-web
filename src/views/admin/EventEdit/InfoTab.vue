<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import { saveEventInfo } from '@/api/event/event'
import { fetchAdminNotices } from '@/api/event/notice'
import type { EventInfoCreateRequest } from '@/api/event'
import RichTextEditor from '@/components/common/RichTextEditor.vue'

interface Props {
  eventId: string
  eventInfo?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()

// ─── Notice Templates ─────────────────────────────────────

const { data: noticeTemplates } = useQuery({
  queryKey: ['admin-notices'],
  queryFn: fetchAdminNotices,
})

const purchaseTemplates = computed(() =>
  (noticeTemplates.value ?? []).filter(n => n.type === 1).sort((a, b) => a.sortOrder - b.sortOrder)
)
const admissionTemplates = computed(() =>
  (noticeTemplates.value ?? []).filter(n => n.type === 2).sort((a, b) => a.sortOrder - b.sortOrder)
)

// ─── Form State ───────────────────────────────────────────

const description = ref('')
const purchaseContent = reactive<Record<string, string>>({})
const admissionContent = reactive<Record<string, string>>({})

const populateFromEventInfo = () => {
  if (!props.eventInfo || !noticeTemplates.value) return
  description.value = props.eventInfo.description || ''

  for (const notice of (props.eventInfo.purchaseNotice ?? [])) {
    const tmpl = purchaseTemplates.value.find(t => t.name === notice.name)
    if (tmpl) purchaseContent[tmpl.id] = notice.description
  }
  for (const notice of (props.eventInfo.admissionNotice ?? [])) {
    const tmpl = admissionTemplates.value.find(t => t.name === notice.name)
    if (tmpl) admissionContent[tmpl.id] = notice.description
  }
}

watch([() => props.eventInfo, noticeTemplates], populateFromEventInfo, { immediate: true })

// ─── Save ─────────────────────────────────────────────────

const saveEventInfoMutation = useMutation({
  mutationFn: (data: EventInfoCreateRequest) => saveEventInfo(props.eventId, data),
  onSuccess: () => {
    toast.success('详情信息保存成功')
    queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
    emit('updated')
  },
  onError: () => {
    toast.error('保存失败')
  },
})

const handleSaveInfo = async () => {
  const purchaseNotice = purchaseTemplates.value
    .filter(t => purchaseContent[t.id]?.trim())
    .map(t => ({ name: t.name, description: purchaseContent[t.id]! }))

  const admissionNotice = admissionTemplates.value
    .filter(t => admissionContent[t.id]?.trim())
    .map(t => ({ name: t.name, description: admissionContent[t.id]! }))

  await saveEventInfoMutation.mutateAsync({
    description: description.value,
    purchaseNotice,
    admissionNotice,
  })
}

defineExpose({ save: handleSaveInfo })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>详情信息</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6 max-w-3xl">

      <!-- 活动描述 -->
      <div class="space-y-2">
        <Label>活动描述</Label>
        <RichTextEditor v-model="description" placeholder="请输入活动描述" />
      </div>

      <!-- 购票须知 -->
      <div class="space-y-3">
        <Label>购票须知</Label>
        <div v-if="purchaseTemplates.length === 0" class="text-sm text-muted-foreground py-2">
          暂无购票须知模板，请先在"须知模板"中添加
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="tmpl in purchaseTemplates"
            :key="tmpl.id"
            class="rounded-lg border p-3 space-y-2"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ tmpl.name }}</span>
            </div>
            <Input
              v-model="purchaseContent[tmpl.id]"
              :placeholder="`填写「${tmpl.name}」的具体内容`"
            />
          </div>
        </div>
      </div>

      <!-- 入场须知 -->
      <div class="space-y-3">
        <Label>入场须知</Label>
        <div v-if="admissionTemplates.length === 0" class="text-sm text-muted-foreground py-2">
          暂无入场须知模板，请先在"须知模板"中添加
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="tmpl in admissionTemplates"
            :key="tmpl.id"
            class="rounded-lg border p-3 space-y-2"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ tmpl.name }}</span>
            </div>
            <Input
              v-model="admissionContent[tmpl.id]"
              :placeholder="`填写「${tmpl.name}」的具体内容`"
            />
          </div>
        </div>
      </div>

    </CardContent>
  </Card>
</template>
