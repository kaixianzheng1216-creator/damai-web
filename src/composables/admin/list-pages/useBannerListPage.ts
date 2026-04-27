import { computed, reactive, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createBanner, deleteBanner, fetchAdminBanners, updateBanner } from '@/api/event/banner'
import { fetchAdminCities } from '@/api/event/city'
import type { BannerCreateRequest, BannerUpdateRequest, BannerVO, CityVO } from '@/api/event'
import { queryKeys } from '@/constants'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import { formatDateTimeLocalInput } from '@/utils/format'

type BannerForm = BannerCreateRequest & { sortOrder?: number }

const adminBannersQueryKey = queryKeys.admin.list('banners')
const adminCitiesQueryKey = queryKeys.admin.list('cities')

export function useBannerListPage() {
  const queryClient = useQueryClient()
  const { confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchTitle = ref('')
  const searchCityId = ref('')

  const { data: citiesData } = useQuery({
    queryKey: adminCitiesQueryKey,
    queryFn: fetchAdminCities,
  })

  const citiesMap = computed(() => {
    const map = new Map<string, CityVO>()
    const cities = citiesData.value ?? []
    cities.forEach((city) => map.set(city.id, city))
    return map
  })

  const queryKey = computed(() => [
    ...adminBannersQueryKey,
    currentPage.value,
    pageSize.value,
    searchTitle.value,
    searchCityId.value,
  ])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminBanners({
        page: currentPage.value,
        size: pageSize.value,
        title: searchTitle.value || undefined,
        cityId: searchCityId.value && searchCityId.value !== 'all' ? searchCityId.value : undefined,
      }),
  })

  const list = computed(() => data.value?.records ?? [])
  const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
  const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive<BannerForm>({
    cityId: '',
    title: '',
    imageUrl: '',
    mobileImageUrl: '',
    jumpUrl: '',
    displayStartAt: '',
    displayEndAt: '',
    sortOrder: 0,
  })

  const dialogTitle = computed(() => (editingId.value ? '编辑 Banner' : '新建 Banner'))
  const dialogDescription = computed(() =>
    editingId.value ? '编辑 Banner 信息' : '创建新的 Banner',
  )

  const resetForm = () => {
    form.cityId = ''
    form.title = ''
    form.imageUrl = ''
    form.mobileImageUrl = ''
    form.jumpUrl = ''
    form.displayStartAt = ''
    form.displayEndAt = ''
    form.sortOrder = 0
  }

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }

  const openEdit = (row: BannerVO) => {
    form.cityId = row.cityId
    form.title = row.title
    form.imageUrl = row.imageUrl
    form.mobileImageUrl = row.mobileImageUrl
    form.jumpUrl = row.jumpUrl
    form.displayStartAt = formatDateTimeLocalInput(row.displayStartAt)
    form.displayEndAt = formatDateTimeLocalInput(row.displayEndAt)
    form.sortOrder = row.sortOrder
    editingId.value = row.id
    showDialog.value = true
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminBannersQueryKey })

  const createMutation = useMutation({
    mutationFn: (payload: BannerCreateRequest) => createBanner(payload),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BannerUpdateRequest }) => updateBanner(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: invalidate,
  })

  watch([searchTitle, searchCityId], () => {
    currentPage.value = 1
  })

  const handleSubmit = async () => {
    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: {
          cityId: form.cityId || undefined,
          title: form.title || undefined,
          imageUrl: form.imageUrl || undefined,
          mobileImageUrl: form.mobileImageUrl || undefined,
          jumpUrl: form.jumpUrl || undefined,
          displayStartAt: form.displayStartAt || undefined,
          displayEndAt: form.displayEndAt || undefined,
          sortOrder: form.sortOrder,
        },
      })
      return
    }

    if (
      !form.cityId ||
      !form.title ||
      !form.imageUrl ||
      !form.mobileImageUrl ||
      !form.jumpUrl ||
      !form.displayStartAt ||
      !form.displayEndAt
    ) {
      return
    }

    await createMutation.mutateAsync({
      cityId: form.cityId,
      title: form.title,
      imageUrl: form.imageUrl,
      mobileImageUrl: form.mobileImageUrl,
      jumpUrl: form.jumpUrl,
      displayStartAt: form.displayStartAt,
      displayEndAt: form.displayEndAt,
      sortOrder: form.sortOrder ?? 0,
    })
  }

  const handleDelete = (row: BannerVO) => {
    openConfirm('确认删除', `确认删除 Banner「${row.title}」？`, () =>
      deleteMutation.mutateAsync(row.id),
    )
  }

  return {
    currentPage,
    pageSize,
    searchTitle,
    searchCityId,
    citiesData,
    citiesMap,
    isLoading,
    list,
    totalRow,
    totalPages,
    showDialog,
    editingId,
    form,
    dialogTitle,
    dialogDescription,
    confirmDialog,
    createMutation,
    updateMutation,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    closeConfirm,
    handleConfirm,
  }
}
