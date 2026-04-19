<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { uploadFile } from '@/api/file/index'

interface Props {
  modelValue?: string
  aspectClass?: string
}

const props = defineProps<Props>()
const resolvedAspect = () => props.aspectClass ?? 'aspect-video'

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)
const isDragging = ref(false)

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await handleFile(target.files[0]!)
  }
}

const handleFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }
  isUploading.value = true
  try {
    const url = await uploadFile(file)
    emit('update:modelValue', url)
  } catch (err) {
    toast.error('上传失败')
    console.error('上传失败', err)
  } finally {
    isUploading.value = false
  }
}

const clearImage = () => {
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  fileInput.value?.click()
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    await handleFile(e.dataTransfer.files[0]!)
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="modelValue"
      :class="[
        'relative group w-full overflow-hidden rounded-lg border bg-muted',
        resolvedAspect(),
      ]"
    >
      <img
        :src="modelValue"
        alt="Preview"
        class="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
      />
      <div
        class="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <Button variant="outline" size="sm" @click.stop="triggerUpload"> 更换 </Button>
        <Button variant="destructive" size="sm" @click.stop="clearImage"> 移除 </Button>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        :class="[
          'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-all duration-300',
          resolvedAspect(),
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        ]"
        @click="triggerUpload"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-foreground">
              {{ isUploading ? '上传中...' : isDragging ? '松开上传图片' : '点击或拖拽上传' }}
            </p>
            <p class="text-xs text-muted-foreground">支持 JPG、PNG、GIF 格式</p>
          </div>
        </div>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      :disabled="isUploading"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
