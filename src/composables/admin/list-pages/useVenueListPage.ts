import { computed, type Ref, type ComputedRef } from 'vue'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { createVenue, deleteVenue, fetchAdminVenuesPage, updateVenue } from '@/api/event/venue'
import { queryKeys } from '@/constants'
import type { VenueCreateRequest, VenueUpdateRequest, VenueVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

type VenueForm = {
  name: string
  province: string
  city: string
  district: string
  address: string
}

export function useVenueListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<VenueVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: VenueForm
  dialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: VenueCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: VenueUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  deleteMutation: { mutateAsync: (id: string) => Promise<unknown> }
  invalidate: () => void
  openCreate: () => void
  openEdit: (row: VenueVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (item: VenueVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const crud = useAdminCrud<VenueVO, VenueForm, VenueCreateRequest, VenueUpdateRequest>({
    queryKeyBase: queryKeys.admin.list('venues'),
    fetchPage: fetchAdminVenuesPage,
    createItem: createVenue,
    updateItem: updateVenue,
    deleteItem: deleteVenue,
    initialForm: {
      name: '',
      province: '',
      city: '',
      district: '',
      address: '',
    },
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除场馆「${item.name}」？`,
    }),
  })

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑场馆' : '新建场馆'))

  const openEdit = (row: VenueVO) => {
    crud.openEdit(row, (item) => ({
      name: item.name,
      province: item.province,
      city: item.city,
      district: item.district,
      address: item.address,
    }))
  }

  const venueSchema = z.object({
    name: z.string().min(1, '请填写场馆名称'),
    province: z.string().min(1, '请填写省份'),
    city: z.string().min(1, '请填写城市'),
    district: z.string().optional(),
    address: z.string().min(1, '请填写地址'),
  })

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        const result = venueSchema.safeParse(crud.form)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message ?? '请填写完整的场馆信息')
          return false
        }
        return true
      },
      getCreateData: () => ({
        name: crud.form.name,
        province: crud.form.province,
        city: crud.form.city,
        district: crud.form.district,
        address: crud.form.address,
      }),
      getUpdateData: () => ({
        name: crud.form.name || undefined,
        province: crud.form.province || undefined,
        city: crud.form.city || undefined,
        district: crud.form.district || undefined,
        address: crud.form.address || undefined,
      }),
    })

  return {
    ...crud,
    dialogTitle,
    openEdit,
    handleSubmit,
  }
}
