import { useSearchFilters } from './useSearchFilters'
import { useSearchResults } from './useSearchResults'

export const useEventSearchPage = () => {
  const filters = useSearchFilters()
  const results = useSearchResults(filters.queryParams)

  return {
    queryParams: filters.queryParams,
    searchQuery: results.searchQuery,
    searchRecords: results.searchRecords,
    totalRow: results.totalRow,
    totalPages: results.totalPages,
    sortOptions: results.sortOptions,
    cityOptions: filters.cityOptions,
    parentCategoryOptions: filters.parentCategoryOptions,
    childCategoryOptions: filters.childCategoryOptions,
    selectedParentCategoryId: filters.selectedParentCategoryId,
    timeOptions: filters.timeOptions,
    visiblePages: results.visiblePages,
    handleFilterChange: filters.handleFilterChange,
    handleParentCategoryChange: filters.handleParentCategoryChange,
    handleCalendarDateChange: filters.handleCalendarDateChange,
    handleSortChange: results.handleSortChange,
    handlePageChange: results.handlePageChange,
  }
}
