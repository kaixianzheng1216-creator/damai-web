<script setup lang="ts">
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import ImageUpload from '@/components/common/ImageUpload.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import type { EventVO } from '@/api/event'
import { useEventBasicTab } from '@/composables/admin'

const props = defineProps<{
  eventId?: string
  isEdit: boolean
  eventData?: EventVO
}>()

const emit = defineEmits<{
  created: [eventId: string]
  updated: []
}>()

const { basicForm, cities, categoryOptions, venues, series, save } = useEventBasicTab({
  eventId: () => props.eventId,
  isEdit: () => props.isEdit,
  eventData: () => props.eventData,
  onCreated: (eventId) => emit('created', eventId),
  onUpdated: () => emit('updated'),
})

defineExpose({ save })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>活动基本信息</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex gap-8 items-start">
        <!-- 左侧：封面（3:4 竖版） -->
        <div class="shrink-0 w-60 space-y-2">
          <Label id="event-basic-cover-label">封面</Label>
          <ImageUpload
            v-model="basicForm.coverUrl"
            aspect-class="aspect-[3/4]"
            preview-alt="活动封面预览"
            upload-label="上传活动封面"
          />
        </div>

        <!-- 右侧：表单 -->
        <div class="flex-1 min-w-0 space-y-4 pt-0.5">
          <div class="grid grid-cols-2 gap-x-4 gap-y-4">
            <div class="space-y-2">
              <Label for="event-basic-name">活动名称 <span class="text-destructive">*</span></Label>
              <Input id="event-basic-name" v-model="basicForm.name" placeholder="请输入活动名称" />
            </div>
            <div class="space-y-2">
              <Label for="event-basic-recommend-weight">推荐权重</Label>
              <Input
                id="event-basic-recommend-weight"
                v-model.number="basicForm.recommendWeight"
                type="number"
                placeholder="数字越大越靠前"
              />
            </div>
            <div class="space-y-2">
              <Label id="event-basic-city-label"
                >城市 <span class="text-destructive">*</span></Label
              >
              <Select v-model="basicForm.cityId">
                <SelectTrigger aria-labelledby="event-basic-city-label">
                  <SelectValue placeholder="请选择城市" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="city in cities" :key="city.id" :value="String(city.id)">
                    {{ city.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label id="event-basic-category-label"
                >分类 <span class="text-destructive">*</span></Label
              >
              <Select v-model="basicForm.categoryId">
                <SelectTrigger aria-labelledby="event-basic-category-label">
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="category in categoryOptions"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label id="event-basic-venue-label"
                >场馆 <span class="text-destructive">*</span></Label
              >
              <Select v-model="basicForm.venueId">
                <SelectTrigger aria-labelledby="event-basic-venue-label">
                  <SelectValue placeholder="请选择场馆" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="venue in venues" :key="venue.id" :value="String(venue.id)">
                    {{ venue.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label id="event-basic-series-label">系列（可选）</Label>
              <Select v-model="basicForm.seriesId">
                <SelectTrigger aria-labelledby="event-basic-series-label">
                  <SelectValue placeholder="不属于任何系列" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不属于任何系列</SelectItem>
                  <SelectItem v-for="item in series" :key="item.id" :value="String(item.id)">
                    {{ item.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
