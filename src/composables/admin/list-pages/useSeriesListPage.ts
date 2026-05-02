import { computed, type Ref, type ComputedRef } from 'vue'
import { useAdminCrud } from '../common/useAdminCrud'
import { createSeries, deleteSeries, fetchAdminSeriesPage, updateSeries } from '@/api/event/series'
import { queryKeys } from '@/constants'
import type { SeriesCreateRequest, SeriesEventVO, SeriesUpdateRequest } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useConfirmDialog'

type SeriesForm = {
  name: string
}

export function useSeriesListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<SeriesEventVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: SeriesForm
  dialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: SeriesCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: SeriesUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  deleteMutation: { mutateAsync: (id: string) => Promise<unknown> }
  invalidate: () => void
  openCreate: () => void
  openEdit: (row: SeriesEventVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (item: SeriesEventVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
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
