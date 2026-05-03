import { computed, type Ref, type ComputedRef } from 'vue'
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

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () =>
        Boolean(crud.form.name && crud.form.province && crud.form.city && crud.form.address),
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
