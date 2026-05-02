<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import type { EventInfoVO } from '@/api/event'
import { useEventInfoTab } from '@/composables/admin'

const RichTextEditor = defineAsyncComponent(() => import('@/components/common/RichTextEditor.vue'))

const props = defineProps<{
  eventId: string
  eventInfo?: EventInfoVO
}>()

const emit = defineEmits<{
  updated: []
}>()

const {
  description,
  purchaseContent,
  admissionContent,
  purchaseTemplates,
  admissionTemplates,
  save,
} = useEventInfoTab({
  eventId: () => props.eventId,
  eventInfo: () => props.eventInfo,
  onUpdated: () => emit('updated'),
})

defineExpose({ save })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>详情信息</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6 max-w-3xl">
      <!-- 活动描述 -->
      <div class="space-y-2">
        <Label id="event-info-description-label">活动描述</Label>
        <RichTextEditor v-model="description" aria-label="活动描述" placeholder="请输入活动描述" />
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
              <Label :for="`purchase-notice-${tmpl.id}`" class="text-sm font-medium">
                {{ tmpl.name }}
              </Label>
            </div>
            <Input
              :id="`purchase-notice-${tmpl.id}`"
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
              <Label :for="`admission-notice-${tmpl.id}`" class="text-sm font-medium">
                {{ tmpl.name }}
              </Label>
            </div>
            <Input
              :id="`admission-notice-${tmpl.id}`"
              v-model="admissionContent[tmpl.id]"
              :placeholder="`填写「${tmpl.name}」的具体内容`"
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
