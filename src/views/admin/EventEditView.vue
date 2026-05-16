<script setup lang="ts">
import { computed, defineAsyncComponent, defineComponent, h, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs'
import { EVENT_STATUS, TOAST_COPY } from '@/constants'
import { useEventEditPage } from '@/composables/admin'

const AdminTabLoading = defineComponent({
  name: 'AdminTabLoading',
  setup: () => () =>
    h(
      'div',
      { class: 'flex items-center justify-center py-12 text-muted-foreground' },
      '加载中...',
    ),
})

const BasicTab = defineAsyncComponent({
  loader: () => import('@/components/features/admin-event-edit/BasicTab.vue'),
  loadingComponent: AdminTabLoading,
})
const ParticipantsTab = defineAsyncComponent({
  loader: () => import('@/components/features/admin-event-edit/ParticipantsTab.vue'),
  loadingComponent: AdminTabLoading,
})
const InfoTab = defineAsyncComponent({
  loader: () => import('@/components/features/admin-event-edit/InfoTab.vue'),
  loadingComponent: AdminTabLoading,
})

interface SavableTab {
  save: () => Promise<boolean | void> | boolean | void
}

const SessionsAndTicketsTab = defineAsyncComponent(
  () => import('@/components/features/admin-event-edit/SessionsAndTicketsTab.vue'),
)
const ServicesTab = defineAsyncComponent(
  () => import('@/components/features/admin-event-edit/ServicesTab.vue'),
)

const {
  eventId,
  isEdit,
  currentTab,
  isSaving,
  eventData,
  eventServices,
  eventParticipants,
  eventInfo,
  sessionsData,
  ticketInventoriesData,
  publishMutation,
  offlineMutation,
  handleCreated,
  goBack,
  invalidateEventDetail,
  invalidateTicketInventories,
  invalidateEventAfterSave,
} = useEventEditPage()

// ─── Child Refs ───────────────────────────────────────────

const basicTabRef = ref<SavableTab | null>(null)
const infoTabRef = ref<SavableTab | null>(null)
const isStatusChanging = computed(
  () => publishMutation.isPending.value || offlineMutation.isPending.value,
)

const handleSessionsUpdated = () => {
  invalidateEventDetail()
  invalidateTicketInventories()
}

// ─── Save Logic ───────────────────────────────────────────

const handleSaveChanges = async () => {
  if (!basicTabRef.value) return

  const editing = isEdit.value
  isSaving.value = true
  try {
    const basicSaved = await basicTabRef.value.save()
    if (basicSaved === false) return

    if (editing && infoTabRef.value) {
      const infoSaved = await infoTabRef.value.save()
      if (infoSaved === false) return
    }

    if (editing) {
      invalidateEventAfterSave()
    }
    toast.success(editing ? TOAST_COPY.eventSaved : TOAST_COPY.eventCreated)
  } catch {
    // Child mutations keep their field-specific error messages.
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-24 sm:pb-20">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold text-foreground">
          {{ isEdit ? '编辑活动' : '创建活动' }}
        </h2>
        <p class="text-muted-sm mt-1">管理活动的基本信息、场次和票种</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button variant="outline" size="sm" @click="goBack">
          <icon-lucide-arrow-left class="mr-1.5 h-4 w-4" />
          返回列表
        </Button>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs v-model="currentTab" class="space-y-6">
      <TabsList>
        <TabsTrigger value="basic-display">基础与展示</TabsTrigger>
        <TabsTrigger value="sessions-tickets" :disabled="!isEdit">场次与票种</TabsTrigger>
        <TabsTrigger value="services" :disabled="!isEdit">服务规则</TabsTrigger>
      </TabsList>

      <!-- Tab 1: Basic + Participants + Info -->
      <TabsContent value="basic-display" class="space-y-6">
        <BasicTab
          ref="basicTabRef"
          :event-id="eventId"
          :is-edit="isEdit"
          :event-data="eventData"
          @created="handleCreated"
        />
        <template v-if="isEdit && eventId">
          <ParticipantsTab
            :event-id="eventId"
            :event-participants="eventParticipants"
            @updated="invalidateEventDetail"
          />
          <InfoTab ref="infoTabRef" :event-id="eventId" :event-info="eventInfo" />
        </template>
      </TabsContent>

      <!-- Tab 2: Sessions & Tickets -->
      <TabsContent value="sessions-tickets">
        <SessionsAndTicketsTab
          v-if="currentTab === 'sessions-tickets' && eventId"
          :event-id="eventId"
          :sessions="sessionsData"
          :ticket-inventories="ticketInventoriesData"
          @updated="handleSessionsUpdated"
        />
      </TabsContent>

      <!-- Tab 3: Services -->
      <TabsContent value="services">
        <ServicesTab
          v-if="currentTab === 'services' && eventId"
          :event-id="eventId"
          :event-services="eventServices"
          @updated="invalidateEventDetail"
        />
      </TabsContent>
    </Tabs>
  </div>

  <!-- Fixed Bottom Action Bar -->
  <div
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-[var(--sidebar-width)]"
  >
    <div class="flex w-full items-center justify-end gap-2 px-4 py-3 sm:gap-3 sm:px-6">
      <Button variant="outline" class="flex-1 sm:flex-none" @click="goBack">取消</Button>
      <Button
        class="flex-1 sm:flex-none"
        :disabled="isSaving || isStatusChanging"
        @click="handleSaveChanges"
      >
        {{ isSaving ? '保存中...' : isEdit ? '保存更改' : '创建活动' }}
      </Button>
      <Button
        v-if="
          isEdit &&
          (eventData?.status === EVENT_STATUS.DRAFT || eventData?.status === EVENT_STATUS.OFFLINE)
        "
        class="flex-1 sm:flex-none"
        @click="publishMutation.mutate()"
        :disabled="isSaving || isStatusChanging"
      >
        {{
          publishMutation.isPending.value
            ? eventData?.status === EVENT_STATUS.OFFLINE
              ? '上线中...'
              : '发布中...'
            : eventData?.status === EVENT_STATUS.OFFLINE
              ? '上线活动'
              : '发布活动'
        }}
      </Button>
      <Button
        v-else-if="isEdit && eventData?.status === EVENT_STATUS.PUBLISHED"
        variant="destructive"
        class="flex-1 sm:flex-none"
        @click="offlineMutation.mutate()"
        :disabled="isSaving || isStatusChanging"
      >
        {{ offlineMutation.isPending.value ? '下线中...' : '下线活动' }}
      </Button>
    </div>
  </div>
</template>
