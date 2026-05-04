import { computed, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adminCreateTicketType, adminUpdateTicketType } from '@/api/event/event'
import type { TicketTypeCreateRequest, TicketTypeUpdateRequest, TicketTypeVO } from '@/api/event'
import { queryKeys, TOAST_COPY, FORM_COPY, TICKET_TYPE_COPY } from '@/constants'
import { formatDateTimeLocalInput } from '@/utils/format'

interface UseTicketTypeDialogOptions {
  eventId: MaybeRefOrGetter<string>
  sessionId: MaybeRefOrGetter<string | null>
  editingTicketType: MaybeRefOrGetter<TicketTypeVO | null>
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

type TicketTypeForm = TicketTypeCreateRequest & Partial<TicketTypeUpdateRequest>

const ticketTypeSchema = z.object({
  name: z.string().min(1, FORM_COPY.fillTicketTypeNameAndPrice),
  salePrice: z.number().positive(FORM_COPY.fillTicketTypeNameAndPrice),
  orderLimit: z.number().min(1),
  accountLimit: z.number().min(1),
  saleStartAt: z.string(),
  saleEndAt: z.string(),
})

const createTicketTypeSchema = ticketTypeSchema.extend({
  totalQty: z.number().positive(FORM_COPY.fillTotalQtyError),
})

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
  const dialogTitle = computed(() =>
    isEditing.value ? TICKET_TYPE_COPY.editTitle : TICKET_TYPE_COPY.createTitle,
  )

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
        ? adminCreateTicketType(toValue(options.eventId), sessionId, payload)
        : Promise.reject(new Error('No session ID'))
    },
    onSuccess: () => {
      toast.success(TOAST_COPY.ticketTypeCreated)
      formError.value = ''
      options.onOpenChange(false)
      invalidateAll()
      options.onSaved()
    },
    onError: () => {
      formError.value = FORM_COPY.ticketTypeCreateFailedRetry
      toast.error(TOAST_COPY.ticketTypeCreateFailed)
    },
  })

  const updateTicketTypeMutation = useMutation({
    mutationFn: ({ ticketTypeId, data }: { ticketTypeId: string; data: TicketTypeUpdateRequest }) =>
      adminUpdateTicketType(toValue(options.eventId), ticketTypeId, data),
    onSuccess: () => {
      toast.success(TOAST_COPY.ticketTypeUpdated)
      formError.value = ''
      options.onOpenChange(false)
      invalidateAll()
      options.onSaved()
    },
    onError: () => {
      formError.value = FORM_COPY.ticketTypeUpdateFailedRetry
      toast.error(TOAST_COPY.ticketTypeUpdateFailed)
    },
  })

  const handleSaveTicketType = async () => {
    const ticketType = editingTicketType.value
    const schema = ticketType ? ticketTypeSchema : createTicketTypeSchema
    const result = schema.safeParse(form)

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? TOAST_COPY.fillCompleteInfo
      formError.value = firstError
      toast.error(firstError)
      return
    }

    formError.value = ''

    if (ticketType) {
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
