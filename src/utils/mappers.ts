import type { PassengerItem, PassengerVO } from '@/api/account'
import type { EventVO, CategoryVO, HomeEventCardItem, HomeCategoryItem } from '@/api/event'
import { formatPrice } from '@/utils/format'

export const mapPassengerToPassengerItem = (passenger: PassengerVO): PassengerItem => ({
  id: passenger.id,
  name: passenger.name,
  certType: passenger.idTypeLabel,
  certNo: passenger.idNoMasked,
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}.${month}.${day} ${weekday} ${hours}:${minutes}`
}

export const convertEventVOToCardItem = (event: EventVO): HomeEventCardItem => ({
  id: event.id,
  seriesName: event.name,
  eventName: event.name,
  coverImageUrl: event.coverUrl,
  venueName: event.venueNameSnapshot ?? '',
  dateText: event.firstSessionStartAt ? formatDate(event.firstSessionStartAt) : '',
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
