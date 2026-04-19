<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { PASSENGER_CERT_TYPES } from '@/constants'
import type { PassengerFormData } from '@/api/account'

defineProps<{
  open: boolean
  passengerError: string
}>()

const form = defineModel<PassengerFormData>('form', { required: true })

const emit = defineEmits<{
  close: []
  submit: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>新建购票人</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <div>
          <Label class="mb-2">姓名</Label>
          <Input v-model="form.name" class="h-10" />
        </div>
        <div>
          <Label class="mb-2">证件类型</Label>
          <Select v-model="form.certType">
            <SelectTrigger class="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="certType in PASSENGER_CERT_TYPES"
                :key="certType"
                :value="certType"
              >
                {{ certType }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="mb-2">证件号</Label>
          <Input v-model="form.certNo" class="h-10" />
        </div>
        <p v-if="passengerError" class="text-sm text-destructive">{{ passengerError }}</p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('close')">取消</Button>
        <Button @click="emit('submit')">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
