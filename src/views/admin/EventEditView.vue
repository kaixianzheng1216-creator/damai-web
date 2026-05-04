<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs'
import { EVENT_STATUS } from '@/constants'
import { useEventEditPage } from '@/composables/admin'

const BasicTab = defineAsyncComponent({
  loader: () => import('@/components/features/admin-event-edit/BasicTab.vue'),
  loadingComponent: {
    template:
      '<div class="flex items-center justify-center py-12 text-muted-foreground">加载中...</div>',
  },
})
const ParticipantsTab = defineAsyncComponent({
  loader: () => import('@/components/features/admin-event-edit/ParticipantsTab.vue'),
  loadingComponent: {
    template:
      '<div class="flex items-center justify-center py-12 text-muted-foreground">加载中...</div>',
  },
})
const InfoTab = defineAsyncComponent({
  loader: () => import('@/components/features/admin-event-edit/InfoTab.vue'),
  loadingComponent: {
    template:
      '<div class="flex items-center justify-center py-12 text-muted-foreground">加载中...</div>',
  },
})

interface SavableTab {
  save: () => Promise<void> | void
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
  publishMutation,
  offlineMutation,
  handleCreated,
  goBack,
  invalidateEventDetail,
} = useEventEditPage()

// ─── Child Refs ───────────────────────────────────────────

const basicTabRef = ref<SavableTab | null>(null)
const infoTabRef = ref<SavableTab | null>(null)

// ─── Save Logic ───────────────────────────────────────────

const handleSaveChanges = async () => {
  isSaving.value = true
  try {
    await basicTabRef.value?.save()
    if (isEdit.value) {
      await infoTabRef.value?.save()
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="pb-20 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-foreground">
          {{ isEdit ? '编辑活动' : '创建活动' }}
        </h2>
        <p class="text-muted-sm mt-1">管理活动的基本信息、场次和票种</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Badge v-if="isEdit && eventData" variant="secondary">
          {{ eventData.statusLabel }}
        </Badge>
        <Button
          v-if="isEdit && eventData?.status === EVENT_STATUS.PUBLISHED"
          variant="outline"
          size="sm"
          class="text-muted-foreground hover:text-destructive hover:border-destructive/40"
          @click="offlineMutation.mutate()"
          :disabled="offlineMutation.isPending.value"
        >
          {{ offlineMutation.isPending.value ? '处理中...' : '下线活动' }}
        </Button>
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
          @updated="invalidateEventDetail"
        />
        <template v-if="isEdit && eventId">
          <ParticipantsTab
            :event-id="eventId"
            :event-participants="eventParticipants"
            @updated="invalidateEventDetail"
          />
          <InfoTab
            ref="infoTabRef"
            :event-id="eventId"
            :event-info="eventInfo"
            @updated="invalidateEventDetail"
          />
        </template>
      </TabsContent>

      <!-- Tab 2: Sessions & Tickets -->
      <TabsContent value="sessions-tickets">
        <SessionsAndTicketsTab
          v-if="currentTab === 'sessions-tickets' && eventId"
          :event-id="eventId"
          :sessions="sessionsData"
          @updated="invalidateEventDetail"
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
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
  >
    <div class="flex items-center justify-end gap-3 px-6 py-3">
      <Button variant="outline" @click="goBack">取消</Button>
      <Button :disabled="isSaving" @click="handleSaveChanges">
        {{ isSaving ? '保存中...' : isEdit ? '保存更改' : '创建活动' }}
      </Button>
      <Button
        v-if="isEdit && eventData?.status === EVENT_STATUS.DRAFT"
        @click="publishMutation.mutate()"
        :disabled="publishMutation.isPending.value"
      >
        {{ publishMutation.isPending.value ? '发布中...' : '发布活动' }}
      </Button>
    </div>
  </div>
</template>
