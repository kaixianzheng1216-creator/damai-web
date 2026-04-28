<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import type { MobileFormData } from '@/api/account'

defineProps<{
  open: boolean
  mobileError: string
  mobileCountdown: number
  isSendingMobileCode: boolean
}>()

const form = defineModel<MobileFormData>('form', { required: true })

const emit = defineEmits<{
  close: []
  sendCode: []
  submit: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
      <DialogHeader>
        <DialogTitle>更换手机号</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <div>
          <Label for="profile-mobile" class="mb-2">新手机号</Label>
          <Input
            id="profile-mobile"
            v-model="form.mobile"
            class="h-10"
            placeholder="请输入 11 位手机号"
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
            />
            <Button
              type="button"
              variant="outline"
              class="shrink-0"
              :disabled="isSendingMobileCode || mobileCountdown > 0"
              @click="emit('sendCode')"
            >
              {{ mobileCountdown > 0 ? `${mobileCountdown}s 后重试` : '获取验证码' }}
            </Button>
          </div>
        </div>
        <p v-if="mobileError" class="text-sm text-destructive">{{ mobileError }}</p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('close')">取消</Button>
        <Button @click="emit('submit')">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
