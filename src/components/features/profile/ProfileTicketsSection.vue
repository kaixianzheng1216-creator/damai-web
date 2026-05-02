<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { TicketVO } from '@/api/ticket'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import TicketCard from '@/components/common/TicketCard.vue'

defineProps<{
  paginatedTickets: TicketVO[]
  ticketPage: number
  ticketTotalPages: number
  ticketPageSize?: number
  ticketTotalRow?: number
}>()

const emit = defineEmits<{
  'update:ticketPage': [page: number]
  'update:ticketPageSize': [pageSize: number]
}>()

const router = useRouter()

const viewTicketDetail = (ticketId: string) => {
  router.push(`/ticket/${ticketId}`)
}
</script>

<template>
  <DataTableCrud
    :data="paginatedTickets"
    :current-page="ticketPage"
    :total-pages="ticketTotalPages"
    :page-size="ticketPageSize || 10"
    :total-row="ticketTotalRow || 0"
    :show-create-button="false"
    @update:current-page="emit('update:ticketPage', $event)"
    @update:page-size="emit('update:ticketPageSize', $event)"
    @row-click="(ticket) => viewTicketDetail(ticket.id)"
  >
    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <TicketCard
          v-for="ticket in data"
          :key="ticket.id"
          :id="ticket.id"
          :event-name-snapshot="ticket.eventNameSnapshot"
          :event-cover-url-snapshot="ticket.eventCoverUrlSnapshot"
          :venue-name-snapshot="ticket.venueNameSnapshot"
          :session-start-at-snapshot="ticket.sessionStartAtSnapshot"
          :passenger-name-snapshot="ticket.passengerNameSnapshot"
          :status-label="ticket.statusLabel"
          :ticket-no="ticket.ticketNo"
          :to="'/ticket/' + ticket.id"
        />
      </div>
    </template>
  </DataTableCrud>
</template>
