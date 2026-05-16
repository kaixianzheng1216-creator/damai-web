<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { uploadAdminFile, uploadFile } from '@/api/file/index'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    aspectClass?: string
    acceptedTypes?: string[]
    maxSizeMb?: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    previewAlt?: string
    uploadLabel?: string
    uploadMode?: 'front' | 'admin'
    compact?: boolean
  }>(),
  {
    aspectClass: 'aspect-video',
    acceptedTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSizeMb: 10,
    previewAlt: '图片预览',
    uploadLabel: '上传图片',
    uploadMode: 'front',
  },
)
const resolvedAspect = computed(() => props.aspectClass)
const acceptedAttribute = computed(() => props.acceptedTypes.join(','))
const acceptedLabel = computed(() =>
  props.acceptedTypes
    .map((type) => type.split('/')[1]?.toUpperCase())
    .filter(Boolean)
    .join('、'),
)
const compactAcceptedLabel = computed(() =>
  props.acceptedTypes
    .map((type) => type.split('/')[1]?.toUpperCase())
    .filter(Boolean)
    .join('/'),
)
const uploadHelpText = computed(() => {
  const types = props.compact ? compactAcceptedLabel.value : acceptedLabel.value
  const typeCopy = props.compact ? types : `支持 ${types} 格式`
  return `${typeCopy}，最大 ${props.maxSizeMb}MB`
})
const uploadHelpId = `${useId()}-help`
const uploadErrorId = `${useId()}-error`

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isUploading = shallowRef(false)
const uploadError = shallowRef('')

const dropZoneRef = ref<HTMLElement>()
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files?.[0]) handleFile(files[0])
  },
  dataTypes: props.acceptedTypes,
})

interface ImageDimensions {
  width: number
  height: number
}

const tempImageFile = ref<File | null>(null)
const tempImageUrl = useObjectUrl(tempImageFile)

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

const getImageDimensions = async (file: File) => {
  tempImageFile.value = file
  await nextTick()
  const url = tempImageUrl.value
  if (!url) throw new Error('无法生成图片链接')

  return new Promise<ImageDimensions>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('无法读取图片尺寸'))
    image.src = url
  })
}

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
  const file = target.files?.[0]
  if (file) {
    await handleFile(file)
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

    const upload = props.uploadMode === 'admin' ? uploadAdminFile : uploadFile
    const url = await upload(file)
    emit('update:modelValue', url)
  } catch (error) {
    console.error('[ImageUpload] Upload failed:', error)
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
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="modelValue"
      :class="['relative group w-full overflow-hidden rounded-lg border bg-muted', resolvedAspect]"
    >
      <img :src="modelValue" alt="已上传图片预览" class="h-full w-full object-cover" />
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
        ref="dropZoneRef"
        :class="[
          'group flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-all duration-300',
          resolvedAspect,
          uploadError
            ? 'border-destructive bg-destructive/5'
            : isOverDropZone
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5',
        ]"
      >
        <Button
          variant="ghost"
          type="button"
          class="h-full min-h-full w-full cursor-pointer rounded-[inherit] whitespace-normal px-3 py-0 hover:bg-transparent"
          @click="triggerUpload"
        >
          <div
            class="flex max-w-full flex-col items-center text-center"
            :class="compact ? 'gap-1.5' : 'gap-2'"
          >
            <div
              class="flex-center rounded-full bg-primary/10"
              :class="compact ? 'h-10 w-10' : 'h-12 w-12'"
            >
              <icon-lucide-upload-cloud
                class="text-primary"
                :class="compact ? 'h-5 w-5' : 'h-6 w-6'"
              />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-foreground">
                {{ isUploading ? '上传中...' : isOverDropZone ? '松开上传图片' : '点击或拖拽上传' }}
              </p>
              <p
                :id="uploadHelpId"
                class="max-w-full px-2 text-xs leading-5 text-muted-foreground"
                :class="compact ? 'truncate' : 'whitespace-normal break-words'"
              >
                {{ uploadHelpText }}
              </p>
            </div>
          </div>
        </Button>
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
      aria-label="上传图片文件"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
