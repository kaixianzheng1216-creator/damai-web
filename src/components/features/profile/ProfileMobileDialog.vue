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
import type { MobileFormData } from '@/api/account'

const props = withDefaults(
  defineProps<{
    open: boolean
    mobileError: string
    mobileCountdown: number
    isSendingMobileCode: boolean
    isSaving?: boolean
  }>(),
  {
    isSaving: false,
  },
)

const form = defineModel<MobileFormData>('form', { required: true })

const emit = defineEmits<{
  close: []
  sendCode: []
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
        <DialogTitle>更换手机号</DialogTitle>
        <DialogDescription>验证码将发送到新的手机号。</DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div>
          <Label for="profile-mobile" class="mb-2">新手机号</Label>
          <Input
            id="profile-mobile"
            v-model="form.mobile"
            class="h-10"
            placeholder="请输入 11 位手机号"
            :disabled="isSaving"
            :aria-invalid="Boolean(mobileError) || undefined"
          />
        </div>
        <div>
          <Label for="profile-mobile-code" class="mb-2">验证码</Label>
          <div class="flex gap-2">
            <Input
              id="profile-mobile-code"
              v-model="form.code"
              class="h-10"
              placeholder="请输入 6 位验证码"
              :disabled="isSaving"
              :aria-invalid="Boolean(mobileError) || undefined"
            />
            <Button
              type="button"
              variant="outline"
              class="shrink-0"
              :disabled="isSaving || isSendingMobileCode || mobileCountdown > 0"
              @click="emit('sendCode')"
            >
              {{ mobileCountdown > 0 ? `${mobileCountdown}s 后重试` : '获取验证码' }}
            </Button>
          </div>
        </div>
        <FieldError v-if="mobileError">{{ mobileError }}</FieldError>
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
