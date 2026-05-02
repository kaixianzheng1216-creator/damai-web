import { computed, reactive, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchAdminCategories } from '@/api/event/category'
import { fetchAdminCities } from '@/api/event/city'
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

export interface UseEventBasicFormOptions {
  eventData: MaybeRefOrGetter<EventVO | undefined>
}

interface CategoryOption {
  id: string
  name: string
  parentName?: string
}

export type EventBasicForm = EventCreateRequest & Partial<EventUpdateRequest>

const normalizeList = <T>(data: T[] | Record<string, T> | undefined): T[] => {
  if (!data) return []
  return Array.isArray(data) ? data : Object.values(data)
}

export function useEventBasicForm(options: UseEventBasicFormOptions) {
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

  return {
    basicForm,
    cities,
    categoryOptions,
    venues,
    series,
  }
}
