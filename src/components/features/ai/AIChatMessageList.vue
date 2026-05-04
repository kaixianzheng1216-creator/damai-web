<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ChatMessage, AiChatItem } from '@/api/ai/types'
import { AI_CHAT_COPY, AVATAR_PLACEHOLDERS } from '@/constants'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/common/ui/button'
import EventCard from '@/components/common/EventCard.vue'
import OrderCard from '@/components/common/OrderCard.vue'
import TicketCard from '@/components/common/TicketCard.vue'

const props = defineProps<{
  messages: ChatMessage[]
  isPending: boolean
  assistantAvatar: string
}>()

defineEmits<{
  suggestion: [text: string]
}>()

const userStore = useUserStore()
const scrollContainer = ref<HTMLDivElement>()
const bottomRef = ref<HTMLDivElement>()

const scrollToBottom = async () => {
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(
  () => [props.messages.length, props.isPending],
  () => scrollToBottom(),
  { immediate: true },
)

const renderCard = (item: AiChatItem) => {
  switch (item.type) {
    case 'event':
      return h(EventCard, {
        id: item.id,
        name: item.name,
        coverUrl: item.coverUrl,
        participantName: item.participantName,
        cityNameSnapshot: item.cityNameSnapshot,
        venueNameSnapshot: item.venueNameSnapshot,
        firstSessionStartAt: item.firstSessionStartAt,
        lastSessionEndAt: item.lastSessionEndAt,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        showBuyButton: true,
      })
    case 'order':
      return h(OrderCard, {
        id: item.id,
        eventNameSnapshot: item.eventNameSnapshot,
        eventCoverUrlSnapshot: item.eventCoverUrlSnapshot,
        venueNameSnapshot: item.venueNameSnapshot,
        sessionStartAtSnapshot: item.sessionStartAtSnapshot,
        totalAmount: item.totalAmount,
        quantity: item.quantity,
        statusLabel: item.statusLabel,
        orderNo: item.orderNo,
      })
    case 'ticket':
      return h(TicketCard, {
        id: item.id,
        eventNameSnapshot: item.eventNameSnapshot,
        eventCoverUrlSnapshot: item.eventCoverUrlSnapshot,
        venueNameSnapshot: item.venueNameSnapshot,
        sessionStartAtSnapshot: item.sessionStartAtSnapshot,
        passengerNameSnapshot: item.passengerNameSnapshot,
        status: item.status,
        statusLabel: item.statusLabel,
        ticketNo: item.ticketNo,
        showButton: true,
      })
    default:
      return null
  }
}
</script>

<template>
  <div ref="scrollContainer" class="overflow-y-auto">
    <div class="mx-auto w-full max-w-[800px] space-y-4 px-4 py-4">
      <div
        v-for="(msg, index) in messages"
        :key="`${msg.role}-${index}-${(msg.content || '').slice(0, 20)}`"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <Avatar v-if="msg.role === 'ai'" class="mr-2 mt-1 h-7 w-7">
          <AvatarImage :src="assistantAvatar" alt="AI助手头像" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>

        <div class="max-w-[85%] md:max-w-[75%]">
          <div
            class="px-4 py-3 text-sm leading-[1.6]"
            :class="
              msg.role === 'user'
                ? 'rounded-[16px_2px_16px_16px] bg-primary/10 text-foreground'
                : 'rounded-[2px_16px_16px_16px] bg-card text-foreground shadow-sm'
            "
          >
            {{ msg.content }}
          </div>

          <div
            v-if="msg.role === 'ai' && msg.suggestions?.length"
            class="mt-2 flex flex-wrap gap-2"
          >
            <Button
              v-for="suggestion in msg.suggestions"
              :key="suggestion"
              type="button"
              variant="outline"
              size="sm"
              class="h-auto rounded-full px-4 py-1.5 text-xs"
              @click="$emit('suggestion', suggestion)"
            >
              {{ suggestion }}
            </Button>
          </div>

          <div v-if="msg.role === 'ai' && msg.items?.length" class="mt-5 space-y-3">
            <p class="text-xs text-muted-foreground">{{ AI_CHAT_COPY.recommended }}</p>
            <div class="space-y-5">
              <component :is="renderCard(item)" v-for="item in msg.items" :key="item.id" />
            </div>
          </div>
        </div>

        <Avatar v-if="msg.role === 'user' && userStore.isLoggedIn" class="ml-2 mt-1 h-7 w-7">
          <AvatarImage
            :src="userStore.userInfo?.avatarUrl || AVATAR_PLACEHOLDERS.SMALL"
            alt="用户头像"
          />
          <AvatarFallback class="bg-primary text-primary-foreground">
            <icon-lucide-user class="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <Avatar v-else-if="msg.role === 'user'" class="ml-2 mt-1 h-7 w-7">
          <AvatarFallback class="bg-primary text-primary-foreground">
            <icon-lucide-user class="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>

      <div v-if="isPending" class="flex justify-start">
        <Avatar class="mr-2 mt-1 h-7 w-7">
          <AvatarImage :src="assistantAvatar" alt="AI助手头像" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div class="rounded-[2px_16px_16px_16px] bg-card px-4 py-3 shadow-sm">
          <div class="flex items-center gap-1.5">
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]"
            />
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]"
            />
            <div class="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
          </div>
        </div>
      </div>
    </div>
    <div ref="bottomRef" />
  </div>
</template>
