import { computed } from 'vue'
import { useAdminCrud } from '../common/useAdminCrud'
import { createVenue, deleteVenue, fetchAdminVenuesPage, updateVenue } from '@/api/event/venue'
import { queryKeys } from '@/constants'
import type { VenueCreateRequest, VenueUpdateRequest, VenueVO } from '@/api/event'

type VenueForm = {
  name: string
  province: string
  city: string
  district: string
  address: string
}

export function useVenueListPage() {
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
