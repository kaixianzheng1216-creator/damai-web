import type { Component } from 'vue'
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Images,
  Layers,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Tags,
  Ticket,
  UserCircle,
  Users,
} from 'lucide-vue-next'

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
    icon: LayoutDashboard,
    showInDashboard: false,
  },
  {
    key: 'banners',
    title: 'Banner 管理',
    label: 'Banner 管理',
    path: '/admin/banners',
    icon: Images,
    showInDashboard: true,
  },
  {
    key: 'events',
    title: '活动管理',
    label: '活动管理',
    path: '/admin/events',
    icon: CalendarDays,
    showInDashboard: true,
  },
  {
    key: 'series',
    title: '系列管理',
    label: '系列管理',
    path: '/admin/series',
    icon: Layers,
    showInDashboard: true,
  },
  {
    key: 'cities',
    title: '城市管理',
    label: '城市管理',
    path: '/admin/cities',
    icon: MapPin,
    showInDashboard: true,
  },
  {
    key: 'categories',
    title: '分类管理',
    label: '分类管理',
    path: '/admin/categories',
    icon: Tags,
    showInDashboard: true,
  },
  {
    key: 'venues',
    title: '场馆管理',
    label: '场馆管理',
    path: '/admin/venues',
    icon: Building2,
    showInDashboard: true,
  },
  {
    key: 'participants',
    title: '参与方管理',
    label: '参与方管理',
    path: '/admin/participants',
    icon: UserCircle,
    showInDashboard: true,
  },
  {
    key: 'notices',
    title: '须知模板',
    label: '须知模板',
    path: '/admin/notices',
    icon: FileText,
    showInDashboard: true,
  },
  {
    key: 'services',
    title: '服务保障',
    label: '服务保障',
    path: '/admin/services',
    icon: BadgeCheck,
    showInDashboard: true,
  },
  {
    key: 'tickets',
    title: '电子票管理',
    label: '电子票管理',
    path: '/admin/tickets',
    icon: Ticket,
    showInDashboard: true,
  },
  {
    key: 'work-orders',
    title: '工单管理',
    label: '工单管理',
    path: '/admin/work-orders',
    icon: MessageCircle,
    showInDashboard: true,
  },
  {
    key: 'users',
    title: '用户管理',
    label: '用户管理',
    path: '/admin/users',
    icon: Users,
    showInDashboard: true,
  },
  {
    key: 'admins',
    title: '管理员管理',
    label: '管理员管理',
    path: '/admin/admins',
    icon: Users,
    showInDashboard: true,
  },
]

export const adminDashboardModules = adminModules.filter((item) => item.showInDashboard)
