<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import type { IdentityFormData } from '@/api/account'

defineProps<{
  open: boolean
  identityError: string
}>()

const form = defineModel<IdentityFormData>('form', { required: true })

const emit = defineEmits<{
  close: []
  submit: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
      <DialogHeader>
        <DialogTitle>实名认证</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <div>
          <Label for="profile-real-name" class="mb-2">真实姓名</Label>
          <Input
            id="profile-real-name"
            v-model="form.realName"
            class="h-10"
            placeholder="请输入真实姓名"
          />
        </div>
        <div>
          <Label for="profile-id-card" class="mb-2">身份证号</Label>
          <Input
            id="profile-id-card"
            v-model="form.idCard"
            class="h-10"
            placeholder="请输入身份证号"
          />
        </div>
        <p v-if="identityError" class="text-sm text-destructive">{{ identityError }}</p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('close')">取消</Button>
        <Button @click="emit('submit')">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
