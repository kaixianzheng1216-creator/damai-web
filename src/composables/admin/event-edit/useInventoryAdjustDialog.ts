import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adminAdjustTicketTypeInventory } from '@/api/event/event'
import type { TicketTypeInventoryAdjustRequest, TicketTypeVO } from '@/api/event'
import { queryKeys, TOAST_COPY, FORM_COPY } from '@/constants'

interface UseInventoryAdjustDialogOptions {
  eventId: MaybeRefOrGetter<string>
  open: MaybeRefOrGetter<boolean>
  ticketType: MaybeRefOrGetter<TicketTypeVO | null>
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const adjustInventorySchema = z.object({
  ticketType: z.custom<TicketTypeVO>((v) => v != null, FORM_COPY.enterNonZeroAdjustQty),
  adjustQty: z.number().refine((v) => v !== 0, FORM_COPY.enterNonZeroAdjustQty),
})

export function useInventoryAdjustDialog(options: UseInventoryAdjustDialogOptions) {
  const queryClient = useQueryClient()
  const adjustQty = ref(0)
  const adjustError = ref('')

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.eventDetail(toValue(options.eventId)),
    })
  }

  watch(
    () => [toValue(options.open), toValue(options.ticketType)?.id] as const,
    ([open]) => {
      if (open) {
        adjustQty.value = 0
        adjustError.value = ''
      }
    },
  )

  const adjustInventoryMutation = useMutation({
    mutationFn: ({
      ticketTypeId,
      data,
    }: {
      ticketTypeId: string
      data: TicketTypeInventoryAdjustRequest
    }) => adminAdjustTicketTypeInventory(toValue(options.eventId), ticketTypeId, data),
    onSuccess: () => {
      toast.success(TOAST_COPY.inventoryAdjusted)
      adjustError.value = ''
      options.onOpenChange(false)
      invalidateAll()
      options.onSaved()
    },
    onError: () => {
      adjustError.value = FORM_COPY.adjustFailedRetry
      toast.error(TOAST_COPY.inventoryAdjustFailed)
    },
  })

  const handleAdjustInventory = async () => {
    const ticketType = toValue(options.ticketType)
    const result = adjustInventorySchema.safeParse({ ticketType, adjustQty: adjustQty.value })

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? TOAST_COPY.enterAdjustQty
      adjustError.value = firstError
      toast.error(firstError)
      return
    }

    adjustError.value = ''
    await adjustInventoryMutation.mutateAsync({
      ticketTypeId: ticketType!.id,
      data: { adjustQty: adjustQty.value },
    })
  }

  return {
    adjustQty,
    adjustError,
    adjustInventoryMutation,
    handleAdjustInventory,
  }
}
