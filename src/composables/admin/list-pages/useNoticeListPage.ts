import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { queryKeys } from '@/constants'
import { createNotice, deleteNotice, fetchAdminNoticesPage, updateNotice } from '@/api/event/notice'
import type { NoticeCreateRequest, NoticeUpdateRequest, NoticeVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

type NoticeForm = {
  type: number
  name: string
  sortOrder: number | undefined
}

export function useNoticeListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  searchType: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<NoticeVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: NoticeForm
  dialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (payload: NoticeCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: NoticeUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  openCreate: () => void
  openEdit: (row: NoticeVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (row: NoticeVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const searchType = ref('')

  const extraSearchParams = computed(() => ({
    type: searchType.value && searchType.value !== 'all' ? Number(searchType.value) : undefined,
  }))

  const crud = useAdminCrud<NoticeVO, NoticeForm, NoticeCreateRequest, NoticeUpdateRequest>({
    queryKeyBase: queryKeys.admin.list('notices'),
    fetchPage: fetchAdminNoticesPage,
    createItem: createNotice,
    updateItem: updateNotice,
    deleteItem: deleteNotice,
    initialForm: {
      type: 1,
      name: '',
      sortOrder: undefined,
    },
    extraSearchParams,
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除须知「${item.name}」？`,
    }),
  })

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑须知' : '新建须知'))

  const openEdit = (row: NoticeVO) => {
    crud.openEdit(row, (item) => ({
      type: item.type,
      name: item.name,
      sortOrder: item.sortOrder,
    }))
  }

  const noticeSchema = z.object({
    type: z.number(),
    name: z.string().min(1, '请填写须知名称'),
    sortOrder: z.number().optional(),
  })

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        const result = noticeSchema.safeParse(crud.form)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message ?? '请填写须知名称')
          return false
        }
        return true
      },
      getCreateData: () => ({
        type: crud.form.type,
        name: crud.form.name,
        sortOrder: crud.form.sortOrder,
      }),
      getUpdateData: () => ({
        name: crud.form.name || undefined,
        sortOrder: crud.form.sortOrder,
      }),
    })

  return {
    ...crud,
    searchType,
    dialogTitle,
    openEdit,
    handleSubmit,
  }
}
