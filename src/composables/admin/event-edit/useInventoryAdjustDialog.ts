import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { adjustTicketTypeInventory } from '@/api/event/event'
import type { TicketTypeInventoryAdjustRequest, TicketTypeVO } from '@/api/event'
import { queryKeys } from '@/constants'

interface UseInventoryAdjustDialogOptions {
  eventId: MaybeRefOrGetter<string>
  open: MaybeRefOrGetter<boolean>
  ticketType: MaybeRefOrGetter<TicketTypeVO | null>
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

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
    }) => adjustTicketTypeInventory(toValue(options.eventId), ticketTypeId, data),
    onSuccess: () => {
      toast.success('库存调整成功')
      adjustError.value = ''
      options.onOpenChange(false)
      invalidateAll()
      options.onSaved()
    },
    onError: () => {
      adjustError.value = '调整失败，请重试'
      toast.error('调整失败')
    },
  })

  const handleAdjustInventory = async () => {
    const ticketType = toValue(options.ticketType)
    if (!ticketType || adjustQty.value === 0) {
      adjustError.value = '请输入非 0 的调整数量'
      toast.error('请输入调整数量')
      return
    }

    adjustError.value = ''
    await adjustInventoryMutation.mutateAsync({
      ticketTypeId: ticketType.id,
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
