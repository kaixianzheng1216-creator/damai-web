<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import {
  SearchDateDialog,
  SearchFilterPanel,
  SearchResultsPanel,
} from '@/components/features/search'
import { useEventSearchDateDialog } from '@/composables/event/useEventSearchDateDialog'
import { useEventSearchPage } from '@/composables/event/useEventSearchPage'

const {
  queryParams,
  searchQuery,
  searchRecords,
  totalRow,
  sortOptions,
  cityOptions,
  parentCategoryOptions,
  childCategoryOptions,
  selectedParentCategoryId,
  timeOptions,
  handleFilterChange,
  handleParentCategoryChange,
  handleCalendarDateChange,
  handleSortChange,
  handlePageChange,
} = useEventSearchPage()

const {
  isOpen: showDateDialog,
  selectedDate,
  dateModel,
  open: openDateDialog,
  confirm: confirmDate,
} = useEventSearchDateDialog({
  getCurrentDate: () => queryParams.value.date,
  onConfirm: handleCalendarDateChange,
})

const handleTimeSelect = (value: number) => {
  if (value === 4) {
    openDateDialog()
    return
  }

  void handleFilterChange('timeType', value)
}

const updateSelectedDate = (date: CalendarDate) => {
  selectedDate.value = date
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:px-6">
    <section>
      <p class="mb-4 text-lg text-foreground">
        共 <span class="px-1 text-primary">{{ totalRow }}</span> 个商品
      </p>

      <SearchFilterPanel
        :city-options="cityOptions"
        :parent-category-options="parentCategoryOptions"
        :child-category-options="childCategoryOptions"
        :time-options="timeOptions"
        :city-id="queryParams.cityId"
        :category-id="queryParams.categoryId"
        :selected-parent-category-id="selectedParentCategoryId"
        :time-type="queryParams.timeType"
        @city-change="handleFilterChange('cityId', $event)"
        @parent-category-change="handleParentCategoryChange"
        @category-change="handleFilterChange('categoryId', $event)"
        @time-select="handleTimeSelect"
      />

      <SearchResultsPanel
        :records="searchRecords"
        :total="totalRow"
        :page="queryParams.page ?? 1"
        :size="queryParams.size ?? 10"
        :sort-type="queryParams.sortType"
        :sort-options="sortOptions"
        :is-loading="searchQuery.isLoading.value"
        :is-error="searchQuery.isError.value"
        @sort-change="handleSortChange"
        @page-change="handlePageChange"
      />
    </section>
  </div>

  <SearchDateDialog
    v-model:open="showDateDialog"
    :date-model="dateModel"
    @update:date="updateSelectedDate"
    @confirm="confirmDate"
  />
</template>
