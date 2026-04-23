<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Input } from '@/components/common/ui/input'
import { useAIChat } from '@/composables/useAIChat'
import { formatPrice } from '@/utils/format'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { AVATAR_PLACEHOLDERS } from '@/constants'
import assistantAvatar from '@/assets/assistant/assistant.png'

const router = useRouter()
const userStore = useUserStore()
const inputRef = ref<InstanceType<typeof Input>>()
const inputValue = ref('')
const scrollContainer = ref<HTMLDivElement>()

const { messages, isPending, submit, resetSession } = useAIChat()

const hasChatStarted = computed(() => messages.value.some((m) => m.role === 'user'))

const quickPrompts = [
  '🔥 近期北京演唱会',
  '👨‍👩‍👧 周末适合带娃的剧',
  '🤔 抢票有什么技巧？',
  '🎭 热门话剧推荐',
  '🎵 音乐节推荐',
  '🏟️ 北京近期体育赛事',
]

const handleSubmit = () => {
  if (!inputValue.value.trim() || isPending.value) return
  submit(inputValue.value)
  inputValue.value = ''
}

const handleSuggestionClick = (text: string) => {
  submit(text)
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

watch(
  () => [messages.value.length, isPending.value],
  () => scrollToBottom(),
  { immediate: true, deep: true },
)

nextTick(() => {
  const el = inputRef.value?.$el as HTMLInputElement | undefined
  el?.focus()
})

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

const handleReset = () => {
  resetSession()
  nextTick(() => {
    const el = inputRef.value?.$el as HTMLInputElement | undefined
    el?.focus()
  })
}

const goBack = () => {
  resetSession()
  router.back()
}
</script>

<template>
  <!--
    CSS Grid 布局：彻底解决 Safari sticky + overflow 时序抖动问题
    grid-rows-[auto_1fr_auto] = Header | 滚动内容区 | Input
    高度由纯 CSS calc(100dvh - header - nav) 计算，零 JS 干预
  -->
  <div
    class="grid grid-rows-[auto_1fr_auto] overflow-hidden bg-[#F5F7FA] h-[calc(100dvh-var(--layout-header)-var(--layout-mobile-nav))] md:h-[calc(100vh-var(--layout-header-desktop))]"
  >
    <!-- Header -->
    <div class="z-10 border-b border-[#EAEAEA] bg-white">
      <div class="mx-auto flex w-full max-w-[800px] items-center justify-between px-4 py-3 md:px-6">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" class="h-8 w-8" @click="goBack">
            <icon-lucide-arrow-left class="h-4 w-4" />
            <span class="sr-only">返回</span>
          </Button>
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <icon-lucide-sparkles class="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 class="text-base font-semibold leading-tight">Damai 智能助手</h1>
              <p class="text-xs text-muted-foreground">为你推荐演出、解答问题</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" class="h-8 w-8" @click="handleReset">
          <icon-lucide-rotate-ccw class="h-4 w-4" />
          <span class="sr-only">清空对话</span>
        </Button>
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div ref="scrollContainer" class="overflow-y-auto">
      <!-- Empty State -->
      <div
        v-if="!hasChatStarted"
        class="mx-auto flex min-h-full w-full max-w-[800px] flex-col items-center justify-center px-4 py-12"
      >
        <img :src="assistantAvatar" alt="AI" class="mb-6 h-auto max-h-36 w-auto object-contain" />
        <h2 class="mb-2 text-center text-2xl font-bold text-gray-900">你好！我是 Damai 智能助手</h2>
        <p class="mb-10 text-center text-base text-muted-foreground">
          我可以帮你找演出、抢热门票、或者解答购票疑问。
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="(prompt, idx) in quickPrompts"
            :key="idx"
            class="h-auto cursor-pointer rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition-all hover:border-primary hover:text-primary active:scale-[0.98] focus:outline-none"
            @click="handleSuggestionClick(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div v-else class="mx-auto w-full max-w-[800px] space-y-4 px-4 py-4">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- AI Avatar -->
          <img
            v-if="msg.role === 'ai'"
            :src="assistantAvatar"
            alt="AI"
            class="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full object-cover"
          />

          <!-- Message Bubble -->
          <div class="max-w-[85%] md:max-w-[75%]">
            <div
              class="px-4 py-3 text-sm leading-[1.6]"
              :class="
                msg.role === 'user'
                  ? 'bg-[#FFF0E6] text-foreground rounded-[16px_2px_16px_16px]'
                  : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-foreground rounded-[2px_16px_16px_16px]'
              "
            >
              {{ msg.content }}
            </div>

            <!-- AI Suggestions -->
            <div
              v-if="msg.role === 'ai' && msg.suggestions?.length"
              class="mt-2 flex flex-wrap gap-2"
            >
              <button
                v-for="(suggestion, sIdx) in msg.suggestions"
                :key="sIdx"
                class="h-auto cursor-pointer rounded-full border-0 bg-orange-50 px-4 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-orange-100 hover:text-primary active:scale-[0.98] focus:outline-none"
                @click="handleSuggestionClick(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>

            <!-- AI Recommended Events -->
            <div v-if="msg.role === 'ai' && msg.items?.length" class="mt-5 space-y-3">
              <p class="text-xs text-muted-foreground">为你推荐</p>
              <div class="space-y-3">
                <RouterLink
                  v-for="item in msg.items"
                  :key="item.id"
                  :to="`/detail/${item.id}`"
                  class="flex gap-3 rounded-xl bg-white p-3 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                >
                  <img
                    :src="item.cover_url"
                    :alt="item.name"
                    class="aspect-[3/4] h-auto w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div class="flex flex-1 flex-col justify-between py-0.5">
                    <div class="space-y-1">
                      <p class="line-clamp-2 text-sm font-bold text-gray-900">{{ item.name }}</p>
                      <div class="space-y-0.5">
                        <p class="flex items-center gap-1 text-xs text-muted-foreground">
                          <icon-lucide-map-pin class="h-3 w-3" />
                          {{ item.venue_name }}
                        </p>
                        <p class="flex items-center gap-1 text-xs text-muted-foreground">
                          <icon-lucide-calendar class="h-3 w-3" />
                          {{ item.start_time }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-end justify-between">
                      <p class="text-lg font-bold text-primary">
                        {{ formatPrice(item.min_price) }}
                      </p>
                      <Button
                        size="sm"
                        class="h-auto rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary/90"
                      >
                        去购票
                      </Button>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- User Avatar -->
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

        <!-- Loading Indicator -->
        <div v-if="isPending" class="flex justify-start">
          <img
            :src="assistantAvatar"
            alt="AI"
            class="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full object-cover"
          />
          <div
            class="rounded-[2px_16px_16px_16px] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
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

    <!-- Input Area -->
    <div class="border-t border-[#EAEAEA] bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div class="mx-auto w-full max-w-[800px] px-4 py-4 pb-6 md:pb-8">
        <div class="flex items-center gap-2">
          <Input
            ref="inputRef"
            v-model="inputValue"
            placeholder="输入你想找的演出..."
            class="flex-1 bg-[#F2F3F5] rounded-full border-0 px-4 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0"
            @keydown="handleKeydown"
          />
          <Button
            size="icon"
            :disabled="!inputValue.trim() || isPending"
            class="shrink-0 rounded-full"
            @click="handleSubmit"
          >
            <icon-lucide-send class="h-4 w-4" />
            <span class="sr-only">发送</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
