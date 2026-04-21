<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { DETAIL_TABS } from '@/constants'
import { Tabs, TabsList, TabsTrigger } from '@/components/common/ui/tabs'
import EventPassengerDialog from '@/components/features/event/EventPassengerDialog.vue'
import EventDetailHero from '@/components/features/event/EventDetailHero.vue'
import EventDetailSidebar from '@/components/features/event/EventDetailSidebar.vue'
import { useEventDetailPage } from '@/composables/event/useEventDetailPage'

const {
  activeTab,
  selectedSessionId,
  selectedTicketTypeId,
  ticketQuantity,
  showPassengerModal,
  detailQuery,
  passengers,
  passengerKeyword,
  availableTicketTypes,
  selectedTicketType,
  selectedTicketTypeLimit,
  selectedTicketTypeAccountLimit,
  isSelectedTicketTypeOnSale,
  isTicketTypeOnSale,
  isUserAccountLimitReached,
  maxTicketQuantity,
  totalPrice,
  passengerSlots,
  duplicatePassengerSelected,
  insufficientPassengerCount,
  canSubmitOrder,
  currentNotices,
  seriesEvents,
  createOrderMutation,
  passengerOptionDisabled,
  updatePassengerForSlot,
  updatePassengerKeyword,
  switchEvent,
  handleBuyNow,
  confirmPassengerAndCreateOrder,
  toggleFollow,
  isFollowed,
  isFollowLoading,
} = useEventDetailPage()

const detail = computed(() => detailQuery.data.value ?? null)
const isLoading = computed(() => detailQuery.isLoading.value)
const isError = computed(() => detailQuery.isError.value)
const isCreatingOrder = computed(() => createOrderMutation.isPending.value)

const sanitizedDescription = computed(() =>
  detail.value?.info.description ? DOMPurify.sanitize(detail.value.info.description) : '',
)
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:px-6">
    <div v-if="isLoading" class="flex min-h-[520px] flex-center">
      <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div v-else-if="isError || !detail" class="flex min-h-[520px] flex-center text-destructive">
      详情加载失败，请稍后重试
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_260px]"
    >
      <section class="border border-border bg-background">
        <EventDetailHero
          :detail="detail"
          :selected-session-id="selectedSessionId"
          :selected-ticket-type-id="selectedTicketTypeId"
          :ticket-quantity="ticketQuantity"
          :selected-ticket-type-limit="selectedTicketTypeLimit"
          :selected-ticket-type-account-limit="selectedTicketTypeAccountLimit"
          :is-selected-ticket-type-on-sale="isSelectedTicketTypeOnSale"
          :is-ticket-type-on-sale="isTicketTypeOnSale"
          :is-user-account-limit-reached="isUserAccountLimitReached"
          :max-ticket-quantity="maxTicketQuantity"
          :total-price="totalPrice"
          :is-creating-order="isCreatingOrder"
          :available-ticket-types="availableTicketTypes"
          :selected-ticket-type="selectedTicketType"
          :series-events="seriesEvents"
          :is-followed="isFollowed"
          :is-follow-loading="isFollowLoading"
          @switch-event="switchEvent"
          @update:selected-session-id="selectedSessionId = $event"
          @update:selected-ticket-type-id="selectedTicketTypeId = $event"
          @update:ticket-quantity="ticketQuantity = $event"
          @buy-now="handleBuyNow"
          @toggle-follow="toggleFollow"
        />

        <Tabs v-model="activeTab" class="border-b border-border bg-muted/20">
          <TabsList class="h-auto w-full justify-start rounded-none border-none bg-transparent p-0">
            <TabsTrigger
              v-for="item in DETAIL_TABS"
              :key="item.value"
              :value="item.value"
              class="rounded-none border-0 border-b-2 border-transparent px-4 py-4 text-sm md:px-8 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {{ item.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div class="p-6">
          <template v-if="activeTab === 'detail'">
            <h2 class="text-xl font-medium text-foreground">活动描述</h2>
            <div
              v-if="sanitizedDescription"
              class="mt-5 rich-text-content"
              v-html="sanitizedDescription"
            ></div>
          </template>

          <template v-else>
            <h2 class="text-xl font-medium text-foreground">
              {{ activeTab === 'purchase' ? '购票须知' : '观演须知' }}
            </h2>
            <div class="mt-5 space-y-6">
              <div
                v-for="(item, index) in currentNotices"
                :key="index"
                class="border-b border-border pb-5 last:border-b-0"
              >
                <p class="text-muted-sm">{{ item.name }}</p>
                <p class="mt-2 text-base leading-8 text-foreground">{{ item.description }}</p>
              </div>
            </div>
          </template>
        </div>
      </section>

      <EventDetailSidebar class="hidden lg:block" :services="detail.services" />
    </div>

    <EventPassengerDialog
      :open="showPassengerModal"
      :passengers="passengers"
      :passenger-keyword="passengerKeyword"
      :passenger-slots="passengerSlots"
      :duplicate-passenger-selected="duplicatePassengerSelected"
      :insufficient-passenger-count="insufficientPassengerCount"
      :is-submitting="isCreatingOrder"
      :can-submit-order="canSubmitOrder"
      :passenger-option-disabled="passengerOptionDisabled"
      @close="showPassengerModal = false"
      @confirm="confirmPassengerAndCreateOrder"
      @update-slot="updatePassengerForSlot($event.index, $event.passengerId)"
      @update:passenger-keyword="updatePassengerKeyword"
    />
  </div>
</template>

<style>
/* 富文本内容样式 - 与 RichTextEditor 保持一致 */
.rich-text-content {
  font-size: 0.9rem;
  line-height: 1.7;
  text-align: left;
}
.rich-text-content h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.875rem 0 0.4rem;
}
.rich-text-content h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0.75rem 0 0.35rem;
}
.rich-text-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0.7rem 0 0.3rem;
}
.rich-text-content p {
  margin: 0.25rem 0;
}
.rich-text-content ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
.rich-text-content ol {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
.rich-text-content li + li {
  margin-top: 0.2rem;
}
.rich-text-content strong {
  font-weight: 700;
}
</style>
