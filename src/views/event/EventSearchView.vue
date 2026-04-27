<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import { useEventSearchPage } from '@/composables/event/useEventSearchPage'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/common/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import { Calendar } from '@/components/common/ui/calendar'
import { Button } from '@/components/common/ui/button'

const {
  queryParams,
  searchQuery,
  sortOptions,
  cityOptions,
  parentCategoryOptions,
  childCategoryOptions,
  selectedParentCategoryId,
  timeOptions,
  handleFilterChange,
  handleSortChange,
  handlePageChange,
} = useEventSearchPage()

const showDateDialog = ref(false)
const selectedCalDate = shallowRef<CalendarDate | undefined>(undefined)

const calDateModel = computed<DateValue | undefined>(
  () => selectedCalDate.value as unknown as DateValue | undefined,
)

const pad = (n: number) => String(n).padStart(2, '0')

const handleTimeClick = (value: number) => {
  if (value === 4) {
    // 按日历：打开日期选择弹窗，初始化已选日期
    const dateStr = queryParams.value.date
    if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number)
      selectedCalDate.value = new CalendarDate(y!, m!, d!)
    } else {
      selectedCalDate.value = undefined
    }
    showDateDialog.value = true
  } else {
    handleFilterChange('timeType', value)
  }
}

const confirmDate = () => {
  if (!selectedCalDate.value) return
  showDateDialog.value = false
  const dateStr = `${selectedCalDate.value.year}-${pad(selectedCalDate.value.month)}-${pad(selectedCalDate.value.day)}`
  handleFilterChange('timeType', 4)
  setTimeout(() => {
    handleFilterChange('date', dateStr)
  }, 0)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:px-6">
    <section>
      <p class="mb-4 text-lg text-foreground">
        共 <span class="px-1 text-primary">{{ searchQuery.data.value?.totalRow ?? 0 }}</span> 个商品
      </p>

      <div class="border border-border bg-background px-5">
        <SearchFilterGroup
          label="城市"
          :options="cityOptions"
          :active-value="queryParams.cityId"
          @change="handleFilterChange('cityId', $event)"
        />

        <SearchFilterGroup
          label="分类"
          :options="parentCategoryOptions"
          :active-value="selectedParentCategoryId"
          @change="
            (v) => {
              selectedParentCategoryId = v as string | undefined
              handleFilterChange('categoryId', v)
            }
          "
        />

        <SearchFilterGroup
          v-if="selectedParentCategoryId"
          label="子分类"
          :options="childCategoryOptions"
          :active-value="queryParams.categoryId"
          @change="handleFilterChange('categoryId', $event)"
        />

        <div class="flex flex-wrap items-start gap-4 py-4">
          <p class="w-12 shrink-0 pt-1 text-sm text-muted-foreground">时间</p>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              v-for="item in timeOptions"
              :key="item.value"
              :class="
                cn(
                  'rounded-sm px-3 py-1.5 text-sm transition-colors',
                  item.value === queryParams.timeType
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted',
                )
              "
              @click="handleTimeClick(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 border border-border bg-background">
        <div
          class="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-2"
        >
          <div class="flex items-center">
            <button
              type="button"
              v-for="item in sortOptions"
              :key="item.value"
              :class="
                cn(
                  'border-r border-border px-5 py-2 text-sm last:border-r-0',
                  item.value === queryParams.sortType ? 'text-primary' : 'text-foreground',
                )
              "
              @click="handleSortChange(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div v-if="searchQuery.isLoading.value" class="flex min-h-[420px] flex-center">
          <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div
          v-else-if="searchQuery.isError.value"
          class="flex min-h-[420px] flex-center text-destructive"
        >
          加载失败，请稍后重试
        </div>

        <div
          v-else-if="!searchQuery.data.value?.records.length"
          class="flex min-h-[420px] flex-center text-muted-foreground"
        >
          没有找到符合条件的演出
        </div>

        <div v-else class="px-4">
          <SearchResultListItem
            v-for="item in searchQuery.data.value.records"
            :key="item.id"
            :item="item"
          />
        </div>

        <Pagination
          v-slot="{ page }"
          :total="Number(searchQuery.data.value?.totalRow ?? 0)"
          :items-per-page="queryParams.size ?? 10"
          :sibling-count="1"
          :default-page="queryParams.page ?? 1"
          :page="queryParams.page ?? 1"
          @update:page="handlePageChange"
          class="justify-end border-t border-border py-5"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious />
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem v-if="item.type === 'page'" :value="item.value" as-child>
                <Button :variant="item.value === page ? 'default' : 'outline'" size="sm">
                  {{ item.value }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :index="index" />
            </template>
            <PaginationNext />
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  </div>

  <!-- Date Picker Dialog -->
  <Dialog v-model:open="showDateDialog">
    <DialogContent class="sm:max-w-[360px]">
      <DialogHeader>
        <DialogTitle>选择日期</DialogTitle>
      </DialogHeader>
      <div class="py-2">
        <Calendar
          :model-value="calDateModel"
          layout="month-and-year"
          locale="zh-CN"
          @update:model-value="selectedCalDate = $event as CalendarDate"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showDateDialog = false">取消</Button>
        <Button :disabled="!selectedCalDate" @click="confirmDate">确认</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
