import type { PassengerItem } from '@/api/account'
import type { PassengerVO } from '@/api/account'
import type { EventVO } from '@/api/event'
import type { CategoryVO } from '@/api/event'
import type { HomeEventCardItem, HomeCategoryItem } from '@/api/event'
import { formatPrice } from '@/utils/format'

export const mapPassengerToPassengerItem = (passenger: PassengerVO): PassengerItem => ({
  id: passenger.id,
  name: passenger.name,
  certType: passenger.idTypeLabel,
  certNo: passenger.idNoMasked,
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
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
    话剧歌剧: 'Theater',
    展览休闲: 'GalleryVertical',
    体育比赛: 'Trophy',
    儿童亲子: 'Baby',
    曲艺杂谈: 'Mic2',
    舞蹈芭蕾: 'Dancer',
    音乐剧: 'Music2',
  }

  return {
    id: category.id,
    name: category.name,
    icon: iconMap[category.name] || 'Ticket',
    linkUrl: `/category?categoryId=${category.id}`,
  }
}
