<script setup lang="ts">
import { Button } from '@/components/common/ui/button'

interface Props {
  isFollowed?: boolean
  isLoading?: boolean
}

const emit = defineEmits<{
  toggle: []
}>()

withDefaults(defineProps<Props>(), {
  isFollowed: false,
  isLoading: false,
})
</script>

<template>
  <Button
    :variant="isFollowed ? 'default' : 'outline'"
    size="sm"
    :disabled="isLoading"
    @click="emit('toggle')"
  >
    <icon-lucide-heart v-if="isFollowed" class="mr-1 h-4 w-4 fill-current" />
    <icon-lucide-heart v-else class="mr-1 h-4 w-4" />
    {{ isFollowed ? '已关注' : '关注' }}
  </Button>
</template>
