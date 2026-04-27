<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { uploadFile } from '@/api/file/index'

interface Props {
  modelValue?: string
  aspectClass?: string
  acceptedTypes?: string[]
  maxSizeMb?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  aspectClass: 'aspect-video',
  acceptedTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeMb: 10,
})
const resolvedAspect = computed(() => props.aspectClass)
const acceptedAttribute = computed(() => props.acceptedTypes.join(','))
const acceptedLabel = computed(() =>
  props.acceptedTypes
    .map((type) => type.split('/')[1]?.toUpperCase())
    .filter(Boolean)
    .join('、'),
)
const uploadHelpId = `image-upload-help-${Math.random().toString(36).slice(2)}`
const uploadErrorId = `image-upload-error-${Math.random().toString(36).slice(2)}`

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isUploading = shallowRef(false)
const isDragging = shallowRef(false)
const uploadError = shallowRef('')

interface ImageDimensions {
  width: number
  height: number
}

const setUploadError = (message: string) => {
  uploadError.value = message
  toast.error(message)
}

const validateFileType = (file: File) => {
  if (!props.acceptedTypes.length) return true
  return props.acceptedTypes.includes(file.type)
}

const validateFileSize = (file: File) => {
  if (!props.maxSizeMb) return true
  return file.size <= props.maxSizeMb * 1024 * 1024
}

const getImageDimensions = (file: File) =>
  new Promise<ImageDimensions>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法读取图片尺寸'))
    }
    image.src = url
  })

const validateImageDimensions = ({ width, height }: ImageDimensions) => {
  if (props.minWidth && width < props.minWidth) {
    return `图片宽度不能小于 ${props.minWidth}px`
  }
  if (props.minHeight && height < props.minHeight) {
    return `图片高度不能小于 ${props.minHeight}px`
  }
  if (props.maxWidth && width > props.maxWidth) {
    return `图片宽度不能大于 ${props.maxWidth}px`
  }
  if (props.maxHeight && height > props.maxHeight) {
    return `图片高度不能大于 ${props.maxHeight}px`
  }
  return ''
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await handleFile(target.files[0]!)
  }
}

const handleFile = async (file: File) => {
  uploadError.value = ''

  if (!file.type.startsWith('image/') || !validateFileType(file)) {
    setUploadError(`请选择 ${acceptedLabel.value || '图片'} 格式的图片`)
    return
  }
  if (!validateFileSize(file)) {
    setUploadError(`图片大小不能超过 ${props.maxSizeMb}MB`)
    return
  }

  isUploading.value = true
  try {
    const dimensions = await getImageDimensions(file)
    const dimensionError = validateImageDimensions(dimensions)
    if (dimensionError) {
      setUploadError(dimensionError)
      return
    }

    const url = await uploadFile(file)
    emit('update:modelValue', url)
  } catch {
    setUploadError('上传失败，请稍后重试')
  } finally {
    isUploading.value = false
  }
}

const clearImage = () => {
  uploadError.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerUpload = () => {
  uploadError.value = ''
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
      :class="['relative group w-full overflow-hidden rounded-lg border bg-muted', resolvedAspect]"
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
        <Button type="button" variant="outline" size="sm" @click.stop="triggerUpload">
          更换
        </Button>
        <Button type="button" variant="destructive" size="sm" @click.stop="clearImage">
          移除
        </Button>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        :class="[
          'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          resolvedAspect,
          uploadError
            ? 'border-destructive bg-destructive/5'
            : isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25',
        ]"
        role="button"
        tabindex="0"
        :aria-invalid="Boolean(uploadError)"
        :aria-describedby="uploadError ? uploadErrorId : uploadHelpId"
        @click="triggerUpload"
        @keydown.enter.prevent="triggerUpload"
        @keydown.space.prevent="triggerUpload"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex-center h-12 w-12 rounded-full bg-primary/10">
            <icon-lucide-upload-cloud class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-foreground">
              {{ isUploading ? '上传中...' : isDragging ? '松开上传图片' : '点击或拖拽上传' }}
            </p>
            <p :id="uploadHelpId" class="text-xs text-muted-foreground">
              支持 {{ acceptedLabel }} 格式，最大 {{ maxSizeMb }}MB
            </p>
          </div>
        </div>
      </div>
      <p v-if="uploadError" :id="uploadErrorId" class="text-xs text-destructive">
        {{ uploadError }}
      </p>
    </div>
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedAttribute"
      :disabled="isUploading"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
