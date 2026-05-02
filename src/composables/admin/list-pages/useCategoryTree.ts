import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchAdminCategoriesPage } from '@/api/event/category'
import type { CategoryVO } from '@/api/event'
import { queryKeys } from '@/constants'

const adminCategoriesQueryKey = queryKeys.admin.list('categories')

export function useCategoryTree(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<CategoryVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showChildrenDialog: Ref<boolean>
  selectedParent: Ref<CategoryVO | null>
  currentChildren: ComputedRef<CategoryVO[]>
  invalidate: () => Promise<void>
  invalidateAndSyncParent: () => Promise<void>
  openManageChildren: (row: CategoryVO) => void
} {
  const queryClient = useQueryClient()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchName = ref('')

  const queryKey = computed(() => [
    ...adminCategoriesQueryKey,
    currentPage.value,
    pageSize.value,
    searchName.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminCategoriesPage({
        page: currentPage.value,
        size: pageSize.value,
        name: searchName.value || undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 0))

  const showChildrenDialog = ref(false)
  const selectedParent = ref<CategoryVO | null>(null)
  const currentChildren = computed(() => selectedParent.value?.children ?? [])

  const syncSelectedParent = () => {
    if (!selectedParent.value) return
    const fresh = list.value.find((category) => category.id === selectedParent.value?.id)
    if (fresh) selectedParent.value = fresh
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey })
  const invalidateAndSyncParent = () => invalidate().then(syncSelectedParent)

  const openManageChildren = (row: CategoryVO) => {
    const fresh = list.value.find((category) => category.id === row.id)
    selectedParent.value = fresh ?? row
    showChildrenDialog.value = true
  }

  watch(searchName, () => {
    currentPage.value = 1
  })

  return {
    currentPage,
    pageSize,
    searchName,
    isLoading,
    list,
    totalRow,
    totalPages,
    showChildrenDialog,
    selectedParent,
    currentChildren,
    invalidate,
    invalidateAndSyncParent,
    openManageChildren,
  }
}
