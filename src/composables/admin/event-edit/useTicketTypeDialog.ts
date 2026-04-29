import { computed, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createTicketType, updateTicketType } from '@/api/event/event'
import type { TicketTypeCreateRequest, TicketTypeUpdateRequest, TicketTypeVO } from '@/api/event'
import { queryKeys } from '@/constants'
import { formatDateTimeLocalInput } from '@/utils/format'

interface UseTicketTypeDialogOptions {
  eventId: MaybeRefOrGetter<string>
  sessionId: MaybeRefOrGetter<string | null>
  editingTicketType: MaybeRefOrGetter<TicketTypeVO | null>
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

type TicketTypeForm = TicketTypeCreateRequest & Partial<TicketTypeUpdateRequest>

export function useTicketTypeDialog(options: UseTicketTypeDialogOptions) {
  const queryClient = useQueryClient()

  const form = reactive<TicketTypeForm>({
    name: '',
    salePrice: 0,
    orderLimit: 1,
    accountLimit: 1,
    saleStartAt: '',
    saleEndAt: '',
    totalQty: 0,
  })
  const formError = ref('')

  const editingTicketType = computed(() => toValue(options.editingTicketType))
  const isEditing = computed(() => Boolean(editingTicketType.value))
  const dialogTitle = computed(() => (isEditing.value ? '编辑票种' : '添加票种'))

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  const resetForm = () => {
    form.name = ''
    form.salePrice = 0
    form.orderLimit = 1
    form.accountLimit = 1
    form.saleStartAt = ''
    form.saleEndAt = ''
    form.totalQty = 0
    formError.value = ''
  }

  watch(
    editingTicketType,
    (ticketType) => {
      if (!ticketType) {
        resetForm()
        return
      }

      form.name = ticketType.name
      form.salePrice = ticketType.salePrice ?? 0
      form.orderLimit = ticketType.orderLimit || 1
      form.accountLimit = ticketType.accountLimit || 1
      form.saleStartAt = formatDateTimeLocalInput(ticketType.saleStartAt)
      form.saleEndAt = formatDateTimeLocalInput(ticketType.saleEndAt)
      form.totalQty = ticketType.inventory?.totalQty ?? 0
    },
    { immediate: true },
  )

  const createTicketTypeMutation = useMutation({
    mutationFn: (payload: TicketTypeCreateRequest) => {
      const sessionId = toValue(options.sessionId)
      return sessionId
        ? createTicketType(toValue(options.eventId), sessionId, payload)
        : Promise.reject(new Error('No session ID'))
    },
    onSuccess: () => {
      toast.success('票种创建成功')
      formError.value = ''
      options.onOpenChange(false)
      invalidateAll()
      options.onSaved()
    },
    onError: () => {
      formError.value = '创建失败，请重试'
      toast.error('创建失败')
    },
  })

  const updateTicketTypeMutation = useMutation({
    mutationFn: ({ ticketTypeId, data }: { ticketTypeId: string; data: TicketTypeUpdateRequest }) =>
      updateTicketType(toValue(options.eventId), ticketTypeId, data),
    onSuccess: () => {
      toast.success('票种更新成功')
      formError.value = ''
      options.onOpenChange(false)
      invalidateAll()
      options.onSaved()
    },
    onError: () => {
      formError.value = '更新失败，请重试'
      toast.error('更新失败')
    },
  })

  const handleSaveTicketType = async () => {
    if (!form.name || form.salePrice <= 0) {
      formError.value = '请填写票种名称和有效售价'
      toast.error('请填写完整信息')
      return
    }

    const ticketType = editingTicketType.value
    if (ticketType) {
      formError.value = ''
      await updateTicketTypeMutation.mutateAsync({
        ticketTypeId: ticketType.id,
        data: {
          name: form.name,
          salePrice: form.salePrice,
          orderLimit: form.orderLimit,
          accountLimit: form.accountLimit,
          saleStartAt: form.saleStartAt || undefined,
          saleEndAt: form.saleEndAt || undefined,
        },
      })
      return
    }

    if (form.totalQty <= 0) {
      formError.value = '请填写大于 0 的总库存'
      toast.error('请填写总库存')
      return
    }

    formError.value = ''
    await createTicketTypeMutation.mutateAsync({
      name: form.name,
      salePrice: form.salePrice,
      orderLimit: form.orderLimit,
      accountLimit: form.accountLimit,
      saleStartAt: form.saleStartAt,
      saleEndAt: form.saleEndAt,
      totalQty: form.totalQty,
    })
  }

  return {
    form,
    formError,
    isEditing,
    dialogTitle,
    createTicketTypeMutation,
    updateTicketTypeMutation,
    handleSaveTicketType,
  }
}
