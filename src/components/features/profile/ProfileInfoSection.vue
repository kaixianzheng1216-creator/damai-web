<script setup lang="ts">
import { ref } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio-group'
import { Label } from '@/components/common/ui/label'
import type { ProfileInfo } from '@/api/account'

defineProps<{
  displayAvatar: string
  years: string[]
  months: string[]
  days: string[]
}>()

const form = defineModel<ProfileInfo>('form', { required: true })

const emit = defineEmits<{
  save: []
  'avatar-selected': [file: File]
}>()

const avatarInputRef = ref<HTMLInputElement | null>(null)

const openAvatarPicker = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  emit('avatar-selected', file)
  input.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div class="rounded-xl border border-border bg-muted/20 p-4">
        <div class="flex flex-col items-center gap-3">
          <img
            :src="displayAvatar"
            alt="avatar"
            class="h-20 w-20 rounded-full border border-border object-cover"
          />
          <button
            type="button"
            class="text-sm font-medium text-primary hover:underline"
            @click="openAvatarPicker"
          >
            更换头像
          </button>
          <p class="text-center text-xs text-muted-foreground">支持 JPG/PNG，建议小于 2MB</p>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />
        </div>
      </div>

      <div class="rounded-xl border border-border p-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <Label class="mb-2"><span class="text-primary">*</span> 昵称</Label>
            <Input v-model="form.nickname" class="h-10" />
          </div>

          <div>
            <Label class="mb-2"><span class="text-primary">*</span> 性别</Label>
            <RadioGroup v-model="form.gender" class="flex h-10 items-center gap-6 rounded-md border border-input px-3">
              <div class="flex items-center gap-1.5">
                <RadioGroupItem id="gender-male" value="male" />
                <Label for="gender-male" class="text-sm font-normal">男</Label>
              </div>
              <div class="flex items-center gap-1.5">
                <RadioGroupItem id="gender-female" value="female" />
                <Label for="gender-female" class="text-sm font-normal">女</Label>
              </div>
            </RadioGroup>
          </div>

          <div class="md:col-span-2">
            <Label class="mb-2">出生日期</Label>
            <div class="flex flex-wrap items-center gap-2">
              <Select v-model="form.birthYear">
                <SelectTrigger class="h-10 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="year in years" :key="year" :value="year"
                    >{{ year }}年</SelectItem
                  >
                </SelectContent>
              </Select>
              <Select v-model="form.birthMonth">
                <SelectTrigger class="h-10 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="month in months" :key="month" :value="month"
                    >{{ month }}月</SelectItem
                  >
                </SelectContent>
              </Select>
              <Select v-model="form.birthDay">
                <SelectTrigger class="h-10 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="day in days" :key="day" :value="day">{{ day }}日</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <Button class="h-10 px-8" @click="emit('save')">保存</Button>
    </div>
  </div>
</template>
