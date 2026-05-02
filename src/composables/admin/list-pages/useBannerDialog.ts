import { computed, reactive, ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { createBanner, deleteBanner, updateBanner } from '@/api/event/banner'
import type { BannerCreateRequest, BannerUpdateRequest, BannerVO } from '@/api/event'
import { formatDateTimeLocalInput } from '@/utils/format'

type BannerForm = BannerCreateRequest & { sortOrder?: number }

export function useBannerDialog(
  invalidate: () => Promise<void>,
  openConfirm: (title: string, description: string, onConfirm: () => void | Promise<void>) => void,
) {
  const showDialog = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive<BannerForm>({
    cityId: '',
    title: '',
    imageUrl: '',
    mobileImageUrl: '',
    jumpUrl: '',
    displayStartAt: '',
    displayEndAt: '',
    sortOrder: 0,
  })

  const dialogTitle = computed(() => (editingId.value ? '编辑 Banner' : '新建 Banner'))
  const dialogDescription = computed(() =>
    editingId.value ? '编辑 Banner 信息' : '创建新的 Banner',
  )

  const resetForm = () => {
    form.cityId = ''
    form.title = ''
    form.imageUrl = ''
    form.mobileImageUrl = ''
    form.jumpUrl = ''
    form.displayStartAt = ''
    form.displayEndAt = ''
    form.sortOrder = 0
  }

  const openCreate = () => {
    resetForm()
    editingId.value = null
    showDialog.value = true
  }

  const openEdit = (row: BannerVO) => {
    form.cityId = row.cityId
    form.title = row.title
    form.imageUrl = row.imageUrl
    form.mobileImageUrl = row.mobileImageUrl
    form.jumpUrl = row.jumpUrl
    form.displayStartAt = formatDateTimeLocalInput(row.displayStartAt)
    form.displayEndAt = formatDateTimeLocalInput(row.displayEndAt)
    form.sortOrder = row.sortOrder
    editingId.value = row.id
    showDialog.value = true
  }

  const createMutation = useMutation({
    mutationFn: (payload: BannerCreateRequest) => createBanner(payload),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BannerUpdateRequest }) => updateBanner(id, data),
    onSuccess: () => {
      invalidate()
      showDialog.value = false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: invalidate,
  })

  const handleSubmit = async () => {
    if (editingId.value) {
      await updateMutation.mutateAsync({
        id: editingId.value,
        data: {
          cityId: form.cityId || undefined,
          title: form.title || undefined,
          imageUrl: form.imageUrl || undefined,
          mobileImageUrl: form.mobileImageUrl || undefined,
          jumpUrl: form.jumpUrl || undefined,
          displayStartAt: form.displayStartAt || undefined,
          displayEndAt: form.displayEndAt || undefined,
          sortOrder: form.sortOrder,
        },
      })
      return
    }

    if (
      !form.cityId ||
      !form.title ||
      !form.imageUrl ||
      !form.mobileImageUrl ||
      !form.jumpUrl ||
      !form.displayStartAt ||
      !form.displayEndAt
    ) {
      toast.error('请填写完整的 Banner 信息')
      return
    }

    await createMutation.mutateAsync({
      cityId: form.cityId,
      title: form.title,
      imageUrl: form.imageUrl,
      mobileImageUrl: form.mobileImageUrl,
      jumpUrl: form.jumpUrl,
      displayStartAt: form.displayStartAt,
      displayEndAt: form.displayEndAt,
      sortOrder: form.sortOrder ?? 0,
    })
  }

  const handleDelete = (row: BannerVO) => {
    openConfirm('确认删除', `确认删除 Banner「${row.title}」？`, () =>
      deleteMutation.mutateAsync(row.id),
    )
  }

  return {
    showDialog,
    editingId,
    form,
    dialogTitle,
    dialogDescription,
    createMutation,
    updateMutation,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
  }
}
