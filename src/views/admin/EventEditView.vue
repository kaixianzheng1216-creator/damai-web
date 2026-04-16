<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/common/ui/button'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/common/ui/tabs'
import { fetchEventById } from '@/api/event/event'
import type { EventServiceGuaranteeVO, EventParticipantVO } from '@/api/event'

import BasicTab from './EventEdit/BasicTab.vue'
import SessionsTab from './EventEdit/SessionsTab.vue'
import TicketTypesTab from './EventEdit/TicketTypesTab.vue'
import ServicesTab from './EventEdit/ServicesTab.vue'
import ParticipantsTab from './EventEdit/ParticipantsTab.vue'
import InfoTab from './EventEdit/InfoTab.vue'

const route = useRoute()
const router = useRouter()

const eventId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!eventId.value)

const { data: eventDetailData } = useQuery({
  queryKey: ['admin-event-detail', eventId],
  queryFn: () => (eventId.value ? fetchEventById(eventId.value) : Promise.resolve(undefined)),
  enabled: computed(() => !!eventId.value),
  staleTime: 1000 * 60 * 5,
})

const eventData = computed(() => eventDetailData.value?.event)
const eventServices = computed(() => (eventDetailData.value?.services ?? []) as unknown as EventServiceGuaranteeVO[])
const eventParticipants = computed(() => (eventDetailData.value?.participants ?? []) as unknown as EventParticipantVO[])
const eventInfo = computed(() => eventDetailData.value?.info)
const sessionsData = computed(() => eventDetailData.value?.sessions)

const handleCreated = (newEventId: string) => {
  router.push(`/admin/events/${newEventId}/edit`)
}

const invalidateTab = () => {
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-foreground">
          {{ isEdit ? '编辑活动' : '创建活动' }}
        </h2>
        <p class="text-sm text-muted-foreground mt-1">
          管理活动的基本信息、场次和票种
        </p>
      </div>
      <Button variant="outline" @click="router.push('/admin/events')">
        <icon-lucide-arrow-left class="mr-2 h-4 w-4" />
        返回列表
      </Button>
    </div>

    <Tabs :default-value="'basic'" class="space-y-4">
      <TabsList>
        <TabsTrigger value="basic">基本信息</TabsTrigger>
        <TabsTrigger value="sessions" :disabled="!isEdit">场次管理</TabsTrigger>
        <TabsTrigger value="ticket-types" :disabled="!isEdit">票种管理</TabsTrigger>
        <TabsTrigger value="services" :disabled="!isEdit">服务保障</TabsTrigger>
        <TabsTrigger value="participants" :disabled="!isEdit">参与方</TabsTrigger>
        <TabsTrigger value="info" :disabled="!isEdit">详情信息</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <BasicTab
          :event-id="eventId"
          :is-edit="isEdit"
          :event-data="eventData"
          @created="handleCreated"
          @updated="invalidateTab"
        />
      </TabsContent>

      <TabsContent value="sessions">
        <SessionsTab
          v-if="eventId"
          :event-id="eventId"
          :sessions="sessionsData"
          @updated="invalidateTab"
        />
      </TabsContent>

      <TabsContent value="ticket-types">
        <TicketTypesTab
          v-if="eventId"
          :event-id="eventId"
          :sessions="sessionsData"
          @updated="invalidateTab"
        />
      </TabsContent>

      <TabsContent value="services">
        <ServicesTab
          v-if="eventId"
          :event-id="eventId"
          :event-services="eventServices"
          @updated="invalidateTab"
        />
      </TabsContent>

      <TabsContent value="participants">
        <ParticipantsTab
          v-if="eventId"
          :event-id="eventId"
          :event-participants="eventParticipants"
          @updated="invalidateTab"
        />
      </TabsContent>

      <TabsContent value="info">
        <InfoTab
          v-if="eventId"
          :event-id="eventId"
          :event-info="eventInfo"
          @updated="invalidateTab"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>

