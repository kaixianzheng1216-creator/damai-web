<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ChatMessage, AiChatItem } from '@/api/ai/types'
import { AI_CHAT_COPY, AVATAR_PLACEHOLDERS } from '@/constants'
import { useUserStore } from '@/stores/user'
import AIChatEventCard from './AIChatEventCard.vue'
import AIChatOrderCard from './AIChatOrderCard.vue'
import AIChatTicketCard from './AIChatTicketCard.vue'

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

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

watch(
  () => [props.messages.length, props.isPending],
  () => scrollToBottom(),
  { immediate: true },
)

const renderCard = (item: AiChatItem) => {
  switch (item.type) {
    case 'event':
      return h(AIChatEventCard, { item })
    case 'order':
      return h(AIChatOrderCard, { item })
    case 'ticket':
      return h(AIChatTicketCard, { item })
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
        :key="index"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <img
          v-if="msg.role === 'ai'"
          :src="assistantAvatar"
          :alt="AI_CHAT_COPY.title"
          class="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full object-cover"
        />

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
            <button
              v-for="suggestion in msg.suggestions"
              :key="suggestion"
              type="button"
              class="h-auto cursor-pointer rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-primary/15 hover:text-primary active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              @click="$emit('suggestion', suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>

          <div v-if="msg.role === 'ai' && msg.items?.length" class="mt-5 space-y-3">
            <p class="text-xs text-muted-foreground">{{ AI_CHAT_COPY.recommended }}</p>
            <div class="space-y-5">
              <component :is="renderCard(item)" v-for="item in msg.items" :key="item.id" />
            </div>
          </div>
        </div>

        <img
          v-if="msg.role === 'user' && userStore.isLoggedIn"
          :src="userStore.userInfo?.avatarUrl || AVATAR_PLACEHOLDERS.SMALL"
          alt="我"
          class="ml-2 mt-1 h-7 w-7 shrink-0 rounded-full object-cover"
        />
        <div
          v-else-if="msg.role === 'user'"
          class="ml-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary"
        >
          <icon-lucide-user class="h-4 w-4 text-primary-foreground" />
        </div>
      </div>

      <div v-if="isPending" class="flex justify-start">
        <img
          :src="assistantAvatar"
          :alt="AI_CHAT_COPY.title"
          class="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full object-cover"
        />
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
  </div>
</template>
