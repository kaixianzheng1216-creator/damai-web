import type { PassengerItem, PassengerVO } from '@/api/account'
import type { EventVO, CategoryVO, HomeEventCardItem, HomeCategoryItem } from '@/api/event'
import { formatPrice, formatDateTimeWithWeekday } from '@/utils/format'

export const mapPassengerToPassengerItem = (passenger: PassengerVO): PassengerItem => ({
  id: passenger.id,
  name: passenger.name,
  certType: passenger.idTypeLabel,
  certNo: passenger.idNoMasked,
})

export const convertEventVOToCardItem = (event: EventVO): HomeEventCardItem => ({
  id: event.id,
  seriesName: event.name,
  eventName: event.name,
  coverImageUrl: event.coverUrl,
  venueName: event.venueNameSnapshot ?? '',
  dateText: event.firstSessionStartAt ? formatDateTimeWithWeekday(event.firstSessionStartAt) : '',
  priceText: event.minPrice != null ? formatPrice(event.minPrice) : '',
  saleStatus: event.statusLabel,
  categoryName: event.categoryNameSnapshot ?? '',
})

export const convertCategoryVOToHomeItem = (category: CategoryVO): HomeCategoryItem => {
  const iconMap: Record<string, string> = {
    演唱会: 'Music',
    话剧歌剧: 'Clapperboard',
    体育: 'Trophy',
    儿童亲子: 'Baby',
    展览休闲: 'Landmark',
    音乐会: 'Piano',
    曲苑杂坛: 'Mic',
    舞蹈芭蕾: 'PersonStanding',
    二次元: 'Gamepad2',
    旅游展览: 'Compass',
  }

  return {
    id: category.id,
    name: category.name,
    icon: iconMap[category.name] || 'Ticket',
    linkUrl: `/category?categoryId=${category.id}`,
  }
}
