import { request } from '@/api/request'
import type { HomeData } from '@/types/home'

export const fetchHomeData = () => {
  return request.get<HomeData>('/home/data')
}
