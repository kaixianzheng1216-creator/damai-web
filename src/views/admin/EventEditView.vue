<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { Button } from '@/components/common/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs'
import { fetchEventById, publishEvent, offlineEvent } from '@/api/event/event'
import { EVENT_STATUS } from '@/constants'

import BasicTab from './EventEdit/BasicTab.vue'
import SessionsAndTicketsTab from './EventEdit/SessionsAndTicketsTab.vue'
import ServicesTab from './EventEdit/ServicesTab.vue'
import ParticipantsTab from './EventEdit/ParticipantsTab.vue'
import InfoTab from './EventEdit/InfoTab.vue'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const eventId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!eventId.value)

const { data: eventDetailData } = useQuery({
  queryKey: ['admin-event-detail', eventId],
  queryFn: () => (eventId.value ? fetchEventById(eventId.value) : Promise.resolve(undefined)),
  enabled: computed(() => !!eventId.value),
  staleTime: 1000 * 60 * 5,
})

const eventData = computed(() => eventDetailData.value?.event)
const eventServices = computed(() => eventDetailData.value?.services ?? [])
const eventParticipants = computed(() => eventDetailData.value?.participants ?? [])
const eventInfo = computed(() => eventDetailData.value?.info)
const sessionsData = computed(() => eventDetailData.value?.sessions)

// ─── Tab Navigation ───────────────────────────────────────

const currentTab = ref('basic-display')

// ─── Child Refs ───────────────────────────────────────────

const basicTabRef = ref<InstanceType<typeof BasicTab> | null>(null)
const infoTabRef = ref<InstanceType<typeof InfoTab> | null>(null)

// ─── Save Logic ───────────────────────────────────────────

const isSaving = ref(false)

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

// ─── Publish / Offline ────────────────────────────────────

const publishMutation = useMutation({
  mutationFn: () => publishEvent(eventId.value!),
  onSuccess: () => {
    toast.success('活动发布成功')
    queryClient.invalidateQueries({ queryKey: ['admin-event-detail', eventId] })
  },
  onError: () => {
    toast.error('发布失败')
  },
})

const offlineMutation = useMutation({
  mutationFn: () => offlineEvent(eventId.value!),
  onSuccess: () => {
    toast.success('活动已下线')
    queryClient.invalidateQueries({ queryKey: ['admin-event-detail', eventId] })
  },
  onError: () => {
    toast.error('下线失败')
  },
})

// ─── Tab Events ───────────────────────────────────────────

const handleCreated = (newEventId: string) => {
  router.push(`/admin/events/${newEventId}/edit`)
}

const invalidateTab = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-event-detail', eventId] })
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
        <p class="text-sm text-muted-foreground mt-1">管理活动的基本信息、场次和票种</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="isEdit && eventData"
          class="text-sm px-2.5 py-0.5 rounded-full border font-medium"
          :class="
            eventData.status === EVENT_STATUS.PUBLISHED
              ? 'text-green-700 border-green-300 bg-green-50'
              : 'text-muted-foreground border-border bg-muted/40'
          "
        >
          {{ eventData.statusLabel }}
        </span>
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
        <Button variant="outline" size="sm" @click="router.push('/admin/events')">
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
          @updated="invalidateTab"
        />
        <template v-if="isEdit && eventId">
          <ParticipantsTab
            :event-id="eventId"
            :event-participants="eventParticipants"
            @updated="invalidateTab"
          />
          <InfoTab
            ref="infoTabRef"
            :event-id="eventId"
            :event-info="eventInfo"
            @updated="invalidateTab"
          />
        </template>
      </TabsContent>

      <!-- Tab 2: Sessions & Tickets -->
      <TabsContent value="sessions-tickets">
        <SessionsAndTicketsTab
          v-if="eventId"
          :event-id="eventId"
          :sessions="sessionsData"
          @updated="invalidateTab"
        />
      </TabsContent>

      <!-- Tab 3: Services -->
      <TabsContent value="services">
        <ServicesTab
          v-if="eventId"
          :event-id="eventId"
          :event-services="eventServices"
          @updated="invalidateTab"
        />
      </TabsContent>
    </Tabs>
  </div>

  <!-- Fixed Bottom Action Bar -->
  <div
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
  >
    <div class="flex items-center justify-end gap-3 px-6 py-3">
      <Button variant="outline" @click="router.push('/admin/events')">取消</Button>
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
