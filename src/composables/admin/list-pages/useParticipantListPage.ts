import { computed, type Ref, type ComputedRef } from 'vue'
import { toast } from 'vue3-toastify'
import { useAdminCrud } from '../common/useAdminCrud'
import { queryKeys } from '@/constants'
import {
  createParticipant,
  deleteParticipant,
  fetchAdminParticipantsPage,
  updateParticipant,
} from '@/api/event/participant'
import type { ParticipantCreateRequest, ParticipantUpdateRequest, ParticipantVO } from '@/api/event'
import type { ConfirmDialogState } from '@/composables/common/useAppConfirmDialog'

type ParticipantForm = {
  name: string
  avatarUrl: string
}

export function useParticipantListPage(): {
  currentPage: Ref<number>
  pageSize: Ref<number>
  searchName: Ref<string>
  isLoading: Ref<boolean>
  list: ComputedRef<ParticipantVO[]>
  totalRow: ComputedRef<number>
  totalPages: ComputedRef<number>
  showDialog: Ref<boolean>
  editingId: Ref<string | null>
  form: ParticipantForm
  dialogTitle: ComputedRef<string>
  confirmDialog: Ref<ConfirmDialogState>
  createMutation: {
    mutateAsync: (data: ParticipantCreateRequest) => Promise<unknown>
    isPending: Ref<boolean>
  }
  updateMutation: {
    mutateAsync: (vars: { id: string; data: ParticipantUpdateRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  deleteMutation: { mutateAsync: (id: string) => Promise<unknown> }
  invalidate: () => void
  openCreate: () => void
  openEdit: (row: ParticipantVO) => void
  handleSubmit: () => Promise<void>
  handleDelete: (item: ParticipantVO) => void
  closeConfirm: () => void
  handleConfirm: () => Promise<void>
} {
  const crud = useAdminCrud<
    ParticipantVO,
    ParticipantForm,
    ParticipantCreateRequest,
    ParticipantUpdateRequest
  >({
    queryKeyBase: queryKeys.admin.list('participants'),
    fetchPage: fetchAdminParticipantsPage,
    createItem: createParticipant,
    updateItem: updateParticipant,
    deleteItem: deleteParticipant,
    initialForm: {
      name: '',
      avatarUrl: '',
    },
    getDeleteConfirmMessage: (item) => ({
      title: '确认删除',
      description: `确认删除参与方「${item.name}」？`,
    }),
  })

  const dialogTitle = computed(() => (crud.editingId.value ? '编辑参与方' : '新建参与方'))

  const openEdit = (row: ParticipantVO) => {
    crud.openEdit(row, (item) => ({
      name: item.name,
      avatarUrl: item.avatarUrl,
    }))
  }

  const participantSchema = z.object({
    name: z.string().min(1, '请填写参与方名称'),
    avatarUrl: z.string().optional(),
  })

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => {
        const result = participantSchema.safeParse(crud.form)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message ?? '请填写参与方名称')
          return false
        }
        return true
      },
      getCreateData: () => ({
        name: crud.form.name,
        avatarUrl: crud.form.avatarUrl || undefined,
      }),
      getUpdateData: () => ({
        name: crud.form.name || undefined,
        avatarUrl: crud.form.avatarUrl || undefined,
      }),
    })

  return {
    ...crud,
    dialogTitle,
    openEdit,
    handleSubmit,
  }
}
