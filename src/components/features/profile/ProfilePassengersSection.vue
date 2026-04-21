<script setup lang="ts">
import { h } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import { useViewMode } from '@/composables/useViewMode'
import type { PassengerItem } from '@/api/account'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card'

defineProps<{
  passengers: PassengerItem[]
  passengerPage: number
  passengerTotalPages: number
  passengerKeyword: string
  passengerPageSize?: number
  passengerTotalRow?: number
}>()

const { viewMode } = useViewMode()

const emit = defineEmits<{
  create: []
  delete: [passengerId: string]
  'update:passengerPage': [page: number]
  'update:passengerKeyword': [value: string]
  'update:passengerPageSize': [pageSize: number]
}>()

const columns: ColumnDef<PassengerItem>[] = [
  {
    accessorKey: 'name',
    header: '姓名',
  },
  {
    accessorKey: 'certType',
    header: '证件类型',
  },
  {
    accessorKey: 'certNo',
    header: '证件号',
  },
  {
    id: 'actions',
    header: '操作',
    size: 150,
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            class: 'h-7 px-2',
            onClick: () => emit('delete', row.original.id),
          },
          () => '删除',
        ),
      ])
    },
  },
]
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="passengers"
    :current-page="passengerPage"
    :total-pages="passengerTotalPages"
    :page-size="passengerPageSize || 10"
    :total-row="passengerTotalRow || 0"
    :view-mode="viewMode"
    @create="emit('create')"
    @update:current-page="emit('update:passengerPage', $event)"
    @update:page-size="emit('update:passengerPageSize', $event)"
  >
    <template #toolbar>
      <Input
        :model-value="passengerKeyword"
        class="h-8 w-40"
        placeholder="搜索姓名"
        @update:model-value="emit('update:passengerKeyword', String($event))"
      />
    </template>

    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <Card v-for="passenger in data" :key="passenger.id">
          <CardHeader class="py-1.5 flex flex-row items-center justify-between">
            <CardTitle class="text-base">{{ passenger.name }}</CardTitle>
            <Button
              size="sm"
              variant="destructive"
              class="h-7 px-2 shrink-0"
              @click="emit('delete', passenger.id)"
            >
              删除
            </Button>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground text-sm">证件类型:</span>
              <span class="text-sm">{{ passenger.certType }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground text-sm">证件号:</span>
              <span class="text-sm">{{ passenger.certNo }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </DataTableCrud>
</template>
