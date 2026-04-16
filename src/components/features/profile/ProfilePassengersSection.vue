<script setup lang="ts">
import { h, computed } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import { useWindowSize } from '@vueuse/core'
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

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const viewMode = computed(() => isMobile.value ? 'card' : 'table')

const emit = defineEmits<{
  create: []
  edit: [passenger: PassengerItem]
  delete: [passengerId: string]
  'update:passengerPage': [page: number]
  'update:passengerKeyword': [value: string]
  'update:passengerPageSize': [pageSize: number]
}>()

const columns: ColumnDef<PassengerItem>[] = [
  {
    accessorKey: 'id',
    header: '序号',
    size: 100,
  },
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
            variant: 'outline',
            class: 'h-7 px-2',
            onClick: () => emit('edit', row.original),
          },
          () => '编辑'
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            class: 'h-7 px-2',
            onClick: () => emit('delete', row.original.id),
          },
          () => '删除'
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
      <div class="flex items-center gap-2">
        <Input
          :model-value="passengerKeyword"
          class="h-8 w-40"
          placeholder="搜索姓名"
          @update:model-value="emit('update:passengerKeyword', String($event))"
        />
        <Button size="sm" @click="emit('create')">
          <icon-lucide-plus class="mr-1.5 h-4 w-4" />
          新建购票人
        </Button>
      </div>
    </template>

    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <Card v-for="passenger in data" :key="passenger.id">
          <CardHeader class="pb-1.5">
            <CardTitle class="text-base">{{ passenger.name }}</CardTitle>
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
            <div class="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                class="h-7 px-2"
                @click="emit('edit', passenger)"
              >
                编辑
              </Button>
              <Button
                size="sm"
                variant="destructive"
                class="h-7 px-2"
                @click="emit('delete', passenger.id)"
              >
                删除
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </DataTableCrud>
</template>
