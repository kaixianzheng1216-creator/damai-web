<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
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

const basicForm = reactive<EventCreateRequest & Partial<EventUpdateRequest>>({
  categoryId: '',
  venueId: '',
  cityId: '',
  name: '',
  coverUrl: '',
  recommendWeight: 0,
})

const toArray = (data: any) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return Object.values(data)
}

watch(() => props.eventData, (newData) => {
  if (!newData) return

  Object.assign(basicForm, {
    categoryId: String(newData.categoryId || ''),
    venueId: String(newData.venueId || ''),
    cityId: String(newData.cityId || ''),
    name: newData.name,
    coverUrl: newData.coverUrl,
    recommendWeight: newData.recommendWeight || 0,
  })
}, { immediate: true, deep: true })

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
    if (props.isEdit && props.eventId) {
      await updateMutation.mutateAsync({ id: props.eventId, data: basicForm })
    } else {
      await createMutation.mutateAsync(basicForm as EventCreateRequest)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>活动基本信息</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex justify-center">
        <div class="w-full max-w-2xl">
          <div class="space-y-2">
            <Label>封面</Label>
            <ImageUpload v-model="basicForm.coverUrl" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>活动名称 <span class="text-destructive">*</span></Label>
          <Input v-model="basicForm.name" placeholder="请输入活动名称" />
        </div>
        <div class="space-y-2">
          <Label>推荐权重</Label>
          <Input v-model.number="basicForm.recommendWeight" type="number" placeholder="数字越大越靠前" />
        </div>
        <div class="space-y-2">
          <Label>城市 <span class="text-destructive">*</span></Label>
          <Select v-model="basicForm.cityId">
            <SelectTrigger>
              <SelectValue placeholder="请选择城市" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="city in toArray(citiesData)" :key="city.id" :value="String(city.id)">
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
              <SelectItem v-for="category in toArray(categoriesData)" :key="category.id" :value="String(category.id)">
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
              <SelectItem v-for="venue in toArray(venuesData)" :key="venue.id" :value="String(venue.id)">
                {{ venue.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button @click="handleSaveBasic" :disabled="isLoading">
        {{ isLoading ? '保存中...' : (isEdit ? '更新' : '创建') }}
      </Button>
    </CardContent>
  </Card>
</template>
