import { computed, type Ref, type ComputedRef } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { queryKeys } from '@/constants'
import {
  createCity,
  deleteCity,
  fetchAdminCitiesPage,
  updateCity,
  updateCityFeatured,
} from '@/api/event/city'
import type { CityCreateRequest, CityUpdateRequest, CityVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

type CityForm = {
  name: string
  pinyin: string
  firstLetter: string
}

export function useCityListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<CityVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: CityForm
  dialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: CityCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: CityUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  deleteMutation: { mutateAsync: (id: string) => Promise<unknown> }
  featuredMutation: { mutate: (vars: { id: string; isFeatured: number }) => void }
  invalidate: () => void
  openCreate: () => void
  openEdit: (row: CityVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (item: CityVO) => void
  toggleFeatured: (row: CityVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const crud = useAdminCrud<CityVO, CityForm, CityCreateRequest, CityUpdateRequest>({
    queryKeyBase: queryKeys.admin.list('cities'),
    fetchPage: fetchAdminCitiesPage,
    createItem: createCity,
    updateItem: updateCity,
    deleteItem: deleteCity,
    initialForm: {
      name: '',
      pinyin: '',
      firstLetter: '',
    },
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除城市「${item.name}」？`,
    }),
  })

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑城市' : '新建城市'))

  const featuredMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: number }) =>
      updateCityFeatured(id, isFeatured as 0 | 1),
    onSuccess: crud.invalidate,
  })

  const openEdit = (row: CityVO) => {
    crud.openEdit(row, (item) => ({
      name: item.name,
      pinyin: item.pinyin,
      firstLetter: item.firstLetter,
    }))
  }

  const citySchema = z.object({
    name: z.string().min(1, '请填写城市名称'),
    pinyin: z.string().min(1, '请填写城市拼音'),
    firstLetter: z.string().min(1, '请填写城市首字母'),
  })

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        const result = citySchema.safeParse(crud.form)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message ?? '请填写完整的城市信息')
          return false
        }
        return true
      },
      getCreateData: () => ({
        name: crud.form.name,
        pinyin: crud.form.pinyin,
        firstLetter: crud.form.firstLetter,
      }),
      getUpdateData: () => ({
        name: crud.form.name || undefined,
        pinyin: crud.form.pinyin || undefined,
        firstLetter: crud.form.firstLetter || undefined,
      }),
    })

  const toggleFeatured = (row: CityVO) => {
    featuredMutation.mutate({
      id: row.id,
      isFeatured: row.isFeatured === 1 ? 0 : 1,
    })
  }

  return {
    ...crud,
    dialogTitle,
    featuredMutation,
    openEdit,
    handleSubmit,
    toggleFeatured,
  }
}
