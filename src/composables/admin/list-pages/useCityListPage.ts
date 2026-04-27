import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
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

type CityForm = {
  name: string
  pinyin: string
  firstLetter: string
}

export function useCityListPage() {
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
      updateCityFeatured(id, isFeatured),
    onSuccess: crud.invalidate,
  })

  const openEdit = (row: CityVO) => {
    crud.openEdit(row, (item) => ({
      name: item.name,
      pinyin: item.pinyin,
      firstLetter: item.firstLetter,
    }))
  }

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => Boolean(crud.form.name && crud.form.pinyin && crud.form.firstLetter),
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
