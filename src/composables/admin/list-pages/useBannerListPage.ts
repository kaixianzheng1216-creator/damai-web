import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { queryKeys } from '@/constants'
import { createBanner, deleteBanner, fetchAdminBannerList, updateBanner } from '@/api/event/banner'
import { fetchAdminCityList } from '@/api/event/city'
import type { BannerCreateRequest, BannerUpdateRequest, BannerVO, CityVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'
import { formatDateTimeLocalInput } from '@/utils/format'

type BannerForm = {
  cityId: string
  title: string
  imageUrl: string
  mobileImageUrl: string
  jumpUrl: string
  displayStartAt: string
  displayEndAt: string
  sortOrder: number
}

export function useBannerListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchTitle: Ref<string>
  searchCityId: Ref<string>
  citiesData: Ref<CityVO[] | undefined>
  citiesMap: ComputedRef<Map<string, CityVO>>
  isLoading: Ref<boolean>
  list: ComputedRef<BannerVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: BannerForm
  dialogTitle: ComputedRef<string>
  dialogDescription: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: BannerCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: BannerUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  openCreate: () => void
  openEdit: (row: BannerVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (row: BannerVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  // ── City data (separate query, not part of banner CRUD) ──

  const adminCitiesQueryKey = queryKeys.admin.list('cities')
  const { data: citiesData } = useQuery({
    queryKey: adminCitiesQueryKey,
    queryFn: fetchAdminCityList,
  })

  const citiesMap = computed(() => {
    const map = new Map<string, CityVO>()
    const cities = citiesData.value ?? []
    cities.forEach((city) => map.set(city.id, city))
    return map
  })

  // ── City filter ──

  const searchCityId = ref('')

  const extraSearchParams = computed(() => ({
    cityId: searchCityId.value && searchCityId.value !== 'all' ? searchCityId.value : undefined,
  }))

  // ── Banner CRUD (useAdminCrud) ──

  const crud = useAdminCrud<BannerVO, BannerForm, BannerCreateRequest, BannerUpdateRequest>({
    queryKeyBase: queryKeys.admin.list('banners'),
    fetchPage: (params) =>
      fetchAdminBannerList({
        page: params.page,
        size: params.size,
        title: (params.name as string) || undefined,
        cityId: (params as Record<string, unknown>).cityId as string | undefined,
      }),
    createItem: createBanner,
    updateItem: updateBanner,
    deleteItem: deleteBanner,
    initialForm: {
      cityId: '',
      title: '',
      imageUrl: '',
      mobileImageUrl: '',
      jumpUrl: '',
      displayStartAt: '',
      displayEndAt: '',
      sortOrder: 0,
    },
    extraSearchParams,
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除 Banner「${item.title}」？`,
    }),
  })

  // ── Custom overrides ──

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑 Banner' : '新建 Banner'))
  const dialogDescription = computed(() =>
    crud.editingId.value ? '编辑 Banner 信息' : '创建新的 Banner',
  )

  const openEdit = (row: BannerVO) => {
    crud.openEdit(row, (item) => ({
      cityId: item.cityId,
      title: item.title,
      imageUrl: item.imageUrl,
      mobileImageUrl: item.mobileImageUrl,
      jumpUrl: item.jumpUrl,
      displayStartAt: formatDateTimeLocalInput(item.displayStartAt),
      displayEndAt: formatDateTimeLocalInput(item.displayEndAt),
      sortOrder: item.sortOrder,
    }))
  }

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        if (crud.editingId.value) return true
        if (
          !crud.form.cityId ||
          !crud.form.title ||
          !crud.form.imageUrl ||
          !crud.form.mobileImageUrl ||
          !crud.form.jumpUrl ||
          !crud.form.displayStartAt ||
          !crud.form.displayEndAt
        ) {
          toast.error('请填写完整的 Banner 信息')
          return false
        }
        return true
      },
      getCreateData: () => ({
        cityId: crud.form.cityId,
        title: crud.form.title,
        imageUrl: crud.form.imageUrl,
        mobileImageUrl: crud.form.mobileImageUrl,
        jumpUrl: crud.form.jumpUrl,
        displayStartAt: crud.form.displayStartAt,
        displayEndAt: crud.form.displayEndAt,
        sortOrder: crud.form.sortOrder ?? 0,
      }),
      getUpdateData: () => ({
        cityId: crud.form.cityId || undefined,
        title: crud.form.title || undefined,
        imageUrl: crud.form.imageUrl || undefined,
        mobileImageUrl: crud.form.mobileImageUrl || undefined,
        jumpUrl: crud.form.jumpUrl || undefined,
        displayStartAt: crud.form.displayStartAt || undefined,
        displayEndAt: crud.form.displayEndAt || undefined,
        sortOrder: crud.form.sortOrder,
      }),
    })

  return {
    ...crud,
    searchTitle: crud.searchName,
    searchCityId,
    citiesData,
    citiesMap,
    dialogTitle,
    dialogDescription,
    openEdit,
    handleSubmit,
  }
}
