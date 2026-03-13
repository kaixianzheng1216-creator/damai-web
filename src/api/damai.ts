import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

export const getBanners = () => request.get('/banners')
export const getCategories = () => request.get('/categories')
export const getCities = () => request.get('/cities')
export const getRecommendBlocks = () => request.get('/recommend/blocks')

export default request
