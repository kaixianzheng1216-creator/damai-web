<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/common/ui/alert-dialog'

defineProps<{
  open: boolean
  title: string
  description: string
  confirmText: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <AlertDialog :open="open" @update:open="(val) => !val && emit('close')">
    <AlertDialogContent class="max-w-sm">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="emit('close')">取消</AlertDialogCancel>
        <AlertDialogAction @click="emit('confirm')">{{ confirmText }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
