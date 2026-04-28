import { computed, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { fetchAdminCategories } from '@/api/event/category'
import { fetchAdminCities } from '@/api/event/city'
import { createEvent, updateEvent } from '@/api/event/event'
import { fetchAdminSeries } from '@/api/event/series'
import { fetchAdminVenues } from '@/api/event/venue'
import type {
  CategoryVO,
  CityVO,
  EventCreateRequest,
  EventUpdateRequest,
  EventVO,
  SeriesEventVO,
  VenueVO,
} from '@/api/event'
import { queryKeys } from '@/constants'

interface UseEventBasicTabOptions {
  eventId: MaybeRefOrGetter<string | undefined>
  isEdit: MaybeRefOrGetter<boolean>
  eventData: MaybeRefOrGetter<EventVO | undefined>
  onCreated: (eventId: string) => void
  onUpdated: () => void
}

interface CategoryOption {
  id: string
  name: string
  parentName?: string
}

type EventBasicForm = EventCreateRequest & Partial<EventUpdateRequest>

const normalizeList = <T>(data: T[] | Record<string, T> | undefined): T[] => {
  if (!data) return []
  return Array.isArray(data) ? data : Object.values(data)
}

export function useEventBasicTab(options: UseEventBasicTabOptions) {
  const queryClient = useQueryClient()
  const isLoading = ref(false)

  const { data: citiesData } = useQuery({
    queryKey: queryKeys.admin.list('cities'),
    queryFn: fetchAdminCities,
  })

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.admin.list('categories'),
    queryFn: fetchAdminCategories,
  })

  const { data: venuesData } = useQuery({
    queryKey: queryKeys.admin.list('venues'),
    queryFn: fetchAdminVenues,
  })

  const { data: seriesData } = useQuery({
    queryKey: queryKeys.admin.list('series'),
    queryFn: fetchAdminSeries,
  })

  const cities = computed(() => normalizeList<CityVO>(citiesData.value))
  const categories = computed(() => normalizeList<CategoryVO>(categoriesData.value))
  const venues = computed(() => normalizeList<VenueVO>(venuesData.value))
  const series = computed(() => normalizeList<SeriesEventVO>(seriesData.value))

  const categoryOptions = computed<CategoryOption[]>(() => {
    const options: CategoryOption[] = []

    for (const category of categories.value) {
      if (String(category.parentId) !== '0') continue

      for (const child of category.children ?? []) {
        options.push({
          id: String(child.id),
          name: `${category.name} - ${child.name}`,
          parentName: category.name,
        })
      }
    }

    return options
  })

  const basicForm = reactive<EventBasicForm>({
    categoryId: '',
    venueId: '',
    cityId: '',
    name: '',
    coverUrl: '',
    recommendWeight: 0,
    seriesId: 'none',
  })

  watch(
    () => toValue(options.eventData),
    (eventData) => {
      if (!eventData) return

      Object.assign(basicForm, {
        categoryId: String(eventData.categoryId || ''),
        venueId: String(eventData.venueId || ''),
        cityId: String(eventData.cityId || ''),
        name: eventData.name,
        coverUrl: eventData.coverUrl,
        recommendWeight: eventData.recommendWeight || 0,
        seriesId: eventData.seriesId ? String(eventData.seriesId) : 'none',
      })
    },
    { immediate: true },
  )

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('events') })
    const eventId = toValue(options.eventId)
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventDetail(eventId) })
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: EventCreateRequest) => createEvent(payload),
    onSuccess: (eventId) => {
      toast.success('活动创建成功')
      options.onCreated(eventId)
    },
    onError: () => {
      toast.error('创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdateRequest }) => updateEvent(id, data),
    onSuccess: () => {
      toast.success('更新成功')
      invalidateAll()
      options.onUpdated()
    },
    onError: () => {
      toast.error('更新失败')
    },
  })

  const buildSubmitData = (): EventCreateRequest => ({
    categoryId: basicForm.categoryId,
    venueId: basicForm.venueId,
    cityId: basicForm.cityId,
    name: basicForm.name,
    coverUrl: basicForm.coverUrl,
    recommendWeight: basicForm.recommendWeight,
    seriesId: basicForm.seriesId === 'none' ? undefined : basicForm.seriesId,
  })

  const save = async () => {
    if (
      !basicForm.name ||
      !basicForm.categoryId ||
      !basicForm.venueId ||
      !basicForm.cityId ||
      !basicForm.coverUrl
    ) {
      toast.error('请填写完整信息')
      return
    }

    isLoading.value = true
    try {
      const submitData = buildSubmitData()
      const eventId = toValue(options.eventId)
      if (toValue(options.isEdit) && eventId) {
        await updateMutation.mutateAsync({ id: eventId, data: submitData })
        return
      }

      await createMutation.mutateAsync(submitData)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    basicForm,
    cities,
    categoryOptions,
    venues,
    series,
    createMutation,
    updateMutation,
    save,
  }
}
