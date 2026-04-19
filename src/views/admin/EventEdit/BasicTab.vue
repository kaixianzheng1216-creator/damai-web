<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Input } from '@/components/common/ui/input'
import { Label } from '@/components/common/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { fetchAdminCities } from '@/api/event/city'
import { fetchAdminCategories } from '@/api/event/category'
import { fetchAdminVenues } from '@/api/event/venue'
import { fetchAdminSeries } from '@/api/event/series'
import { createEvent, updateEvent } from '@/api/event/event'
import type { EventCreateRequest, EventUpdateRequest } from '@/api/event'

interface Props {
  eventId?: string
  isEdit: boolean
  eventData?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'created', eventId: string): void
  (e: 'updated'): void
}>()

const queryClient = useQueryClient()
const isLoading = ref(false)

const { data: citiesData } = useQuery({
  queryKey: ['admin-cities'],
  queryFn: fetchAdminCities,
})

const { data: categoriesData } = useQuery({
  queryKey: ['admin-categories'],
  queryFn: fetchAdminCategories,
})

const { data: venuesData } = useQuery({
  queryKey: ['admin-venues'],
  queryFn: fetchAdminVenues,
})

const { data: seriesData } = useQuery({
  queryKey: ['admin-series'],
  queryFn: fetchAdminSeries,
})

// 构建分类列表 - 只显示子分类
const categoryOptions = computed(() => {
  const categories = toArray(categoriesData.value)
  const options: { id: string; name: string; parentName?: string }[] = []

  for (const cat of categories) {
    if (!cat) continue
    if (String(cat.parentId) === '0') {
      const children = cat.children
      if (children && Array.isArray(children)) {
        for (const child of children) {
          if (child && child.id) {
            options.push({
              id: String(child.id),
              name: `${cat.name} - ${child.name}`,
              parentName: cat.name,
            })
          }
        }
      }
    }
  }

  return options
})

const basicForm = reactive<EventCreateRequest & Partial<EventUpdateRequest>>({
  categoryId: '',
  venueId: '',
  cityId: '',
  name: '',
  coverUrl: '',
  recommendWeight: 0,
  seriesId: 'none',
})

const toArray = (data: any) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  // 如果是Proxy对象，直接提取values
  try {
    return Object.values(data)
  } catch {
    return []
  }
}

watch(
  () => props.eventData,
  (newData) => {
    if (!newData) return

    console.log('eventData:', newData)
    console.log('eventData.categoryId:', newData.categoryId, 'type:', typeof newData.categoryId)

    Object.assign(basicForm, {
      categoryId: String(newData.categoryId || ''),
      venueId: String(newData.venueId || ''),
      cityId: String(newData.cityId || ''),
      name: newData.name,
      coverUrl: newData.coverUrl,
      recommendWeight: newData.recommendWeight || 0,
      seriesId: newData.seriesId ? String(newData.seriesId) : 'none',
    })
  },
  { immediate: true, deep: true },
)

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-events'] })
  if (props.eventId) {
    queryClient.invalidateQueries({ queryKey: ['admin-event-detail', props.eventId] })
  }
}

const createMutation = useMutation({
  mutationFn: (data: EventCreateRequest) => createEvent(data),
  onSuccess: (eventId) => {
    toast.success('活动创建成功')
    emit('created', eventId)
  },
  onError: () => {
    toast.error('创建失败')
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: EventUpdateRequest }) => updateEvent(id, data),
  onSuccess: () => {
    toast.success('更新成功')
    invalidateAll()
    emit('updated')
  },
  onError: () => {
    toast.error('更新失败')
  },
})

const handleSaveBasic = async () => {
  if (!basicForm.name || !basicForm.categoryId || !basicForm.venueId || !basicForm.cityId) {
    toast.error('请填写完整信息')
    return
  }

  isLoading.value = true
  try {
    const submitData = {
      ...basicForm,
      seriesId: basicForm.seriesId === 'none' ? null : basicForm.seriesId,
    }
    if (props.isEdit && props.eventId) {
      await updateMutation.mutateAsync({ id: props.eventId, data: submitData })
    } else {
      await createMutation.mutateAsync(submitData as EventCreateRequest)
    }
  } finally {
    isLoading.value = false
  }
}

defineExpose({ save: handleSaveBasic })
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
          <Label>封面</Label>
          <ImageUpload v-model="basicForm.coverUrl" aspect-class="aspect-[3/4]" />
        </div>

        <!-- 右侧：表单 -->
        <div class="flex-1 min-w-0 space-y-4 pt-0.5">
          <div class="grid grid-cols-2 gap-x-4 gap-y-4">
            <div class="space-y-2">
              <Label>活动名称 <span class="text-destructive">*</span></Label>
              <Input v-model="basicForm.name" placeholder="请输入活动名称" />
            </div>
            <div class="space-y-2">
              <Label>推荐权重</Label>
              <Input
                v-model.number="basicForm.recommendWeight"
                type="number"
                placeholder="数字越大越靠前"
              />
            </div>
            <div class="space-y-2">
              <Label>城市 <span class="text-destructive">*</span></Label>
              <Select v-model="basicForm.cityId">
                <SelectTrigger>
                  <SelectValue placeholder="请选择城市" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="city in toArray(citiesData)"
                    :key="city.id"
                    :value="String(city.id)"
                  >
                    {{ city.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>分类 <span class="text-destructive">*</span></Label>
              <Select v-model="basicForm.categoryId">
                <SelectTrigger>
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
              <Label>场馆 <span class="text-destructive">*</span></Label>
              <Select v-model="basicForm.venueId">
                <SelectTrigger>
                  <SelectValue placeholder="请选择场馆" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="venue in toArray(venuesData)"
                    :key="venue.id"
                    :value="String(venue.id)"
                  >
                    {{ venue.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>系列（可选）</Label>
              <Select v-model="basicForm.seriesId">
                <SelectTrigger>
                  <SelectValue placeholder="不属于任何系列" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不属于任何系列</SelectItem>
                  <SelectItem v-for="s in toArray(seriesData)" :key="s.id" :value="String(s.id)">
                    {{ s.name }}
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
