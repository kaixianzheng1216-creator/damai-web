<script setup lang="ts" generic="TData">
import type { Row } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { Card, CardContent } from '@/components/common/ui/card'
import EmptyState from '@/components/common/EmptyState.vue'

interface Props {
  loading?: boolean
  data: TData[]
  rows: Row<TData>[]
}

defineProps<Props>()
</script>

<template>
  <div class="relative space-y-4">
    <div v-if="loading" class="absolute inset-0 z-10 flex-center bg-background/60 backdrop-blur-sm">
      <icon-lucide-loader2 class="h-6 w-6 animate-spin text-primary" />
    </div>

    <template v-if="data.length && !loading">
      <slot name="cardTemplate" :data="data" :rows="rows">
        <div class="space-y-4">
          <Card v-for="row in rows" :key="row.id">
            <CardContent class="pt-6">
              <div class="space-y-2">
                <div
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="flex items-center gap-2"
                >
                  <span class="text-muted-foreground text-sm">
                    <FlexRender
                      :render="cell.column.columnDef.header"
                      :props="cell.getContext()"
                    />:
                  </span>
                  <span class="text-sm">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </slot>
    </template>
    <div v-else-if="!loading" class="flex min-h-80 flex-center">
      <EmptyState class="min-h-80" title="暂无数据" />
    </div>
  </div>
</template>
