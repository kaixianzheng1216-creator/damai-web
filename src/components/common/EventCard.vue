<script setup lang="ts">
import { AI_CHAT_COPY } from '@/constants'
import CardListItem from '@/components/common/CardListItem.vue'
import { Button } from '@/components/common/ui/button'
import { formatPriceRange, formatDateTimeRange } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    id: string
    name: string
    coverUrl?: string
    participantName?: string
    cityNameSnapshot?: string
    venueNameSnapshot?: string
    firstSessionStartAt?: string
    lastSessionEndAt?: string
    minPrice?: number
    maxPrice?: number
    to?: string
    showBuyButton?: boolean
  }>(),
  {
    showBuyButton: true,
  },
)

defineEmits<{
  unfollow: []
}>()

const linkTarget = computed(() => props.to || `/detail/${props.id}`)
</script>

<template>
  <CardListItem :to="linkTarget">
    <template #cover>
      <img
        :src="coverUrl || ''"
        alt="活动封面"
        class="aspect-[3/4] h-auto w-24 rounded-lg object-cover"
      />
    </template>
    <template #title>
      <p class="line-clamp-2 text-sm font-bold text-foreground">{{ name }}</p>
    </template>
    <template #details>
      <p v-if="participantName" class="text-xs text-muted-foreground">
        {{ participantName }}
      </p>
      <p class="flex items-center gap-1 text-xs text-muted-foreground">
        <icon-lucide-map-pin class="h-3 w-3" />{{ cityNameSnapshot
        }}<template v-if="cityNameSnapshot && venueNameSnapshot"> | </template
        >{{ venueNameSnapshot }}
      </p>
      <p class="flex items-center gap-1 text-xs text-muted-foreground">
        <icon-lucide-calendar class="h-3 w-3" />{{
          formatDateTimeRange(firstSessionStartAt, lastSessionEndAt)
        }}
      </p>
    </template>
    <template #bottomLeft>
      <p v-if="minPrice != null" class="text-lg font-bold text-primary">
        {{ formatPriceRange(minPrice, maxPrice ?? minPrice) }}
      </p>
      <p v-else class="text-xs text-muted-foreground" />
    </template>
    <template #bottomRight>
      <Button v-if="showBuyButton" size="sm" class="h-auto rounded px-3 py-1 text-xs">
        {{ AI_CHAT_COPY.buyTicket }}
      </Button>
      <Button
        v-else
        variant="outline"
        size="sm"
        class="h-auto rounded px-3 py-1 text-xs"
        @click.stop="$emit('unfollow')"
      >
        取消关注
      </Button>
    </template>
  </CardListItem>
</template>
