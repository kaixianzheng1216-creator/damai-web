import { computed } from 'vue'
import { useAdminCrud } from '../common/useAdminCrud'
import { createSeries, deleteSeries, fetchAdminSeriesPage, updateSeries } from '@/api/event/series'
import { queryKeys } from '@/constants'
import type { SeriesCreateRequest, SeriesEventVO, SeriesUpdateRequest } from '@/api/event'

type SeriesForm = {
  name: string
}

export function useSeriesListPage() {
  const crud = useAdminCrud<SeriesEventVO, SeriesForm, SeriesCreateRequest, SeriesUpdateRequest>({
    queryKeyBase: queryKeys.admin.list('series'),
    fetchPage: fetchAdminSeriesPage,
    createItem: createSeries,
    updateItem: updateSeries,
    deleteItem: deleteSeries,
    initialForm: {
      name: '',
    },
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除系列「${item.name}」？`,
    }),
  })

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑系列' : '新建系列'))

  const openEdit = (row: SeriesEventVO) => {
    crud.openEdit(row, (item) => ({
      name: item.name,
    }))
  }

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => Boolean(crud.form.name),
      getCreateData: () => ({
        name: crud.form.name,
      }),
      getUpdateData: () => ({
        name: crud.form.name || undefined,
      }),
    })

  return {
    ...crud,
    dialogTitle,
    openEdit,
    handleSubmit,
  }
}
