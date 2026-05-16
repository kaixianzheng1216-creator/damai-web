<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { UserFollowEventVO } from '@/api/event'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import EventCard from '@/components/common/EventCard.vue'

defineProps<{
  paginatedEvents: UserFollowEventVO[]
  page: number
  totalPages: number
  pageSize?: number
  totalRow?: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'toggle-follow': [eventId: string]
}>()

const router = useRouter()

const viewEventDetail = (eventId: string) => {
  router.push(`/detail/${eventId}`)
}

const handleUnfollowClick = (eventId: string) => {
  emit('toggle-follow', eventId)
}
</script>

<template>
  <DataTableCrud
    :data="paginatedEvents"
    :current-page="page"
    :total-pages="totalPages"
    :page-size="pageSize || 10"
    :total-row="totalRow || 0"
    :show-create-button="false"
    @update:current-page="emit('update:page', $event)"
    @update:page-size="emit('update:pageSize', $event)"
    @row-click="(item) => item.event && viewEventDetail(item.event.id)"
  >
    <template #cardTemplate="{ data }">
      <div class="space-y-3 sm:space-y-4">
        <template v-for="item in data" :key="item.id">
          <EventCard
            v-if="item.event"
            :id="item.eventId"
            :name="item.event.name"
            :cover-url="item.event.coverUrl"
            :venue-name-snapshot="item.event.venueNameSnapshot"
            :city-name-snapshot="item.event.cityNameSnapshot"
            :first-session-start-at="item.event.firstSessionStartAt"
            :last-session-end-at="item.event.lastSessionEndAt"
            :min-price="item.event.minPrice"
            :max-price="item.event.maxPrice"
            :to="'/detail/' + item.eventId"
            :show-buy-button="false"
            @unfollow="handleUnfollowClick(item.eventId)"
          />
        </template>
      </div>
    </template>
  </DataTableCrud>
</template>
