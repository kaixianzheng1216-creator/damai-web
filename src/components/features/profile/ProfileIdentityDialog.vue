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
import type { IdentityFormData } from '@/api/account'

const props = withDefaults(
  defineProps<{
    open: boolean
    identityError: string
    isSaving?: boolean
  }>(),
  {
    isSaving: false,
  },
)

const form = defineModel<IdentityFormData>('form', { required: true })

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
        <DialogTitle>实名认证</DialogTitle>
        <DialogDescription>请填写与证件一致的实名信息。</DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div>
          <Label for="profile-real-name" class="mb-2">真实姓名</Label>
          <Input
            id="profile-real-name"
            v-model="form.realName"
            class="h-10"
            placeholder="请输入真实姓名"
            :disabled="isSaving"
            :aria-invalid="Boolean(identityError) || undefined"
          />
        </div>
        <div>
          <Label for="profile-id-card" class="mb-2">身份证号</Label>
          <Input
            id="profile-id-card"
            v-model="form.idCard"
            class="h-10"
            placeholder="请输入身份证号"
            :disabled="isSaving"
            :aria-invalid="Boolean(identityError) || undefined"
          />
        </div>
        <FieldError v-if="identityError">{{ identityError }}</FieldError>
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
