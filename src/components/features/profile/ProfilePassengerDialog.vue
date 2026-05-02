<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/common/ui/dialog'
import { FieldError } from '@/components/common/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { PASSENGER_CERT_TYPES } from '@/constants'
import type { PassengerFormData } from '@/api/account'

const props = withDefaults(
  defineProps<{
    open: boolean
    passengerError: string
    isSaving?: boolean
  }>(),
  {
    isSaving: false,
  },
)

const form = defineModel<PassengerFormData>('form', { required: true })

const emit = defineEmits<{
  close: []
  submit: []
}>()

const handleOpenChange = (value: boolean) => {
  if (!value && !props.isSaving) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md" :show-close-button="!isSaving">
      <DialogHeader>
        <DialogTitle>新建购票人</DialogTitle>
        <DialogDescription>购票人信息将用于实名制购票和入场核验。</DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div>
          <Label for="profile-passenger-name" class="mb-2">姓名</Label>
          <Input
            id="profile-passenger-name"
            v-model="form.name"
            class="h-10"
            :disabled="isSaving"
            :aria-invalid="Boolean(passengerError) || undefined"
          />
        </div>
        <div>
          <Label id="profile-passenger-cert-type-label" class="mb-2">证件类型</Label>
          <Select v-model="form.certType" :disabled="isSaving">
            <SelectTrigger class="h-10 w-full" aria-labelledby="profile-passenger-cert-type-label">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="certType in Object.values(PASSENGER_CERT_TYPES)"
                :key="certType.label"
                :value="certType.label"
              >
                {{ certType.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label for="profile-passenger-cert-no" class="mb-2">证件号</Label>
          <Input
            id="profile-passenger-cert-no"
            v-model="form.certNo"
            class="h-10"
            :disabled="isSaving"
            :aria-invalid="Boolean(passengerError) || undefined"
          />
        </div>
        <FieldError v-if="passengerError">{{ passengerError }}</FieldError>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" :disabled="isSaving" @click="emit('close')">
          取消
        </Button>
        <Button type="button" :disabled="isSaving" @click="emit('submit')">
          <icon-lucide-loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ isSaving ? '保存中...' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
