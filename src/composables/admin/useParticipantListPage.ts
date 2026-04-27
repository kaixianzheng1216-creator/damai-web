import { computed } from 'vue'
import { useAdminCrud } from './useAdminCrud'
import {
  createParticipant,
  deleteParticipant,
  fetchAdminParticipantsPage,
  updateParticipant,
} from '@/api/event/participant'
import type {
  ParticipantCreateRequest,
  ParticipantPageRequest,
  ParticipantUpdateRequest,
  ParticipantVO,
} from '@/api/event'

type ParticipantForm = {
  name: string
  avatarUrl: string
}

export function useParticipantListPage() {
  const crud = useAdminCrud<
    ParticipantVO,
    ParticipantForm,
    ParticipantCreateRequest,
    ParticipantUpdateRequest,
    ParticipantPageRequest
  >({
    queryKeyBase: 'admin-participants',
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

  const handleSubmit = () =>
    crud.handleSubmit({
      validate: () => Boolean(crud.form.name),
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
