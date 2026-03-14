export interface Banner {
  id: number
  imageUrl: string
  linkUrl: string
  title: string
}

export interface Category {
  id: number
  name: string
  icon: string
  linkUrl: string
}

export interface EventItem {
  id: number
  title: string
  coverUrl: string
  venue: string
  date: string
  priceStr: string
  status?: string
  category: string
}

export interface HomeData {
  banners: Banner[]
  categories: Category[]
  concerts: EventItem[]
  dramas: EventItem[]
  sports: EventItem[]
  kids: EventItem[]
}
