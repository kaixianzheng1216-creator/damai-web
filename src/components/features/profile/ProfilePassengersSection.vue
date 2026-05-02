<script setup lang="ts">
import type { PassengerItem } from '@/api/account'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import CardListItem from '@/components/common/CardListItem.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'

defineProps<{
  passengers: PassengerItem[]
  passengerPage: number
  passengerTotalPages: number
  passengerKeyword: string
  passengerPageSize?: number
  passengerTotalRow?: number
}>()

const emit = defineEmits<{
  create: []
  delete: [passengerId: string]
  'update:passengerPage': [page: number]
  'update:passengerKeyword': [value: string]
  'update:passengerPageSize': [pageSize: number]
}>()
</script>

<template>
  <DataTableCrud
    :data="passengers"
    :current-page="passengerPage"
    :total-pages="passengerTotalPages"
    :page-size="passengerPageSize || 10"
    :total-row="passengerTotalRow || 0"
    @create="emit('create')"
    @update:current-page="emit('update:passengerPage', $event)"
    @update:page-size="emit('update:passengerPageSize', $event)"
  >
    <template #toolbar>
      <Input
        :model-value="passengerKeyword"
        class="h-8 w-40"
        placeholder="搜索姓名"
        aria-label="搜索购票人姓名"
        @update:model-value="emit('update:passengerKeyword', String($event))"
      />
    </template>

    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <CardListItem v-for="passenger in data" :key="passenger.id">
          <template #title>
            <p class="line-clamp-2 text-sm font-bold text-foreground">{{ passenger.name }}</p>
          </template>
          <template #details>
            <p class="flex items-center gap-1 text-xs text-muted-foreground">
              证件类型: {{ passenger.certType }}
            </p>
            <p class="flex items-center gap-1 text-xs text-muted-foreground">
              证件号: {{ passenger.certNo }}
            </p>
          </template>
          <template #bottomRight>
            <Button
              size="sm"
              variant="outline"
              class="h-auto rounded px-3 py-1 text-xs"
              @click.stop="emit('delete', passenger.id)"
            >
              删除
            </Button>
          </template>
        </CardListItem>
      </div>
    </template>
  </DataTableCrud>
</template>
