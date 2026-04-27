import type { Component } from 'vue'
import {
  IconBuilding,
  IconCalendar,
  IconFileText,
  IconLayoutDashboard,
  IconMapPin,
  IconMessageCircle,
  IconPhoto,
  IconShieldCheck,
  IconStack,
  IconTags,
  IconTicket,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-vue'

export interface AdminModuleItem {
  key: string
  title: string
  label: string
  path: string
  icon: Component
  showInDashboard: boolean
}

export const adminModules: AdminModuleItem[] = [
  {
    key: 'dashboard',
    title: '仪表盘',
    label: '仪表盘',
    path: '/admin',
    icon: IconLayoutDashboard,
    showInDashboard: false,
  },
  {
    key: 'banners',
    title: 'Banner 管理',
    label: 'Banner 管理',
    path: '/admin/banners',
    icon: IconPhoto,
    showInDashboard: true,
  },
  {
    key: 'events',
    title: '活动管理',
    label: '活动管理',
    path: '/admin/events',
    icon: IconCalendar,
    showInDashboard: true,
  },
  {
    key: 'series',
    title: '系列管理',
    label: '系列管理',
    path: '/admin/series',
    icon: IconStack,
    showInDashboard: true,
  },
  {
    key: 'cities',
    title: '城市管理',
    label: '城市管理',
    path: '/admin/cities',
    icon: IconMapPin,
    showInDashboard: true,
  },
  {
    key: 'categories',
    title: '分类管理',
    label: '分类管理',
    path: '/admin/categories',
    icon: IconTags,
    showInDashboard: true,
  },
  {
    key: 'venues',
    title: '场馆管理',
    label: '场馆管理',
    path: '/admin/venues',
    icon: IconBuilding,
    showInDashboard: true,
  },
  {
    key: 'participants',
    title: '参与方管理',
    label: '参与方管理',
    path: '/admin/participants',
    icon: IconUserCircle,
    showInDashboard: true,
  },
  {
    key: 'notices',
    title: '须知模板',
    label: '须知模板',
    path: '/admin/notices',
    icon: IconFileText,
    showInDashboard: true,
  },
  {
    key: 'services',
    title: '服务保障',
    label: '服务保障',
    path: '/admin/services',
    icon: IconShieldCheck,
    showInDashboard: true,
  },
  {
    key: 'tickets',
    title: '电子票管理',
    label: '电子票管理',
    path: '/admin/tickets',
    icon: IconTicket,
    showInDashboard: true,
  },
  {
    key: 'work-orders',
    title: '工单管理',
    label: '工单管理',
    path: '/admin/work-orders',
    icon: IconMessageCircle,
    showInDashboard: true,
  },
  {
    key: 'users',
    title: '用户管理',
    label: '用户管理',
    path: '/admin/users',
    icon: IconUsers,
    showInDashboard: true,
  },
  {
    key: 'admins',
    title: '管理员管理',
    label: '管理员管理',
    path: '/admin/admins',
    icon: IconUsers,
    showInDashboard: true,
  },
]

export const adminDashboardModules = adminModules.filter((item) => item.showInDashboard)
