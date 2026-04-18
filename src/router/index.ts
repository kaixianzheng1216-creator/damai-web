import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/home/HomeView.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'category',
          name: 'category',
          component: () => import('@/views/event/EventSearchView.vue'),
          meta: { title: '分类' },
        },
        {
          path: 'detail/:id',
          name: 'detail',
          component: () => import('@/views/event/EventDetailView.vue'),
          meta: { title: '活动详情' },
        },
        {
          path: 'checkout/:id',
          name: 'checkout',
          component: () => import('@/views/trade/CheckoutView.vue'),
          meta: { title: '结算', requiresAuth: true },
        },
        {
          path: 'order/:id',
          name: 'order-detail',
          component: () => import('@/views/trade/OrderDetailView.vue'),
          meta: { title: '订单详情', requiresAuth: true },
        },
        {
          path: 'ticket/:id',
          name: 'ticket-detail',
          component: () => import('@/views/ticket/TicketDetailView.vue'),
          meta: { title: '电子票详情', requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue'),
          meta: { title: '个人中心', requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginView.vue'),
      meta: { title: '管理员登录' },
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
          meta: { title: '仪表盘' },
        },
        {
          path: 'banners',
          name: 'admin-banners',
          component: () => import('@/views/admin/BannerListView.vue'),
          meta: { title: 'Banner 管理' },
        },
        {
          path: 'events',
          name: 'admin-events',
          component: () => import('@/views/admin/EventListView.vue'),
          meta: { title: '活动管理' },
        },
        {
          path: 'events/create',
          name: 'admin-event-create',
          component: () => import('@/views/admin/EventEditView.vue'),
          meta: { title: '创建活动' },
        },
        {
          path: 'events/:id/edit',
          name: 'admin-event-edit',
          component: () => import('@/views/admin/EventEditView.vue'),
          meta: { title: '活动编辑' },
        },
        {
          path: 'series',
          name: 'admin-series',
          component: () => import('@/views/admin/SeriesListView.vue'),
          meta: { title: '系列管理' },
        },
        {
          path: 'cities',
          name: 'admin-cities',
          component: () => import('@/views/admin/CityListView.vue'),
          meta: { title: '城市管理' },
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/views/admin/CategoryListView.vue'),
          meta: { title: '分类管理' },
        },
        {
          path: 'venues',
          name: 'admin-venues',
          component: () => import('@/views/admin/VenueListView.vue'),
          meta: { title: '场馆管理' },
        },
        {
          path: 'participants',
          name: 'admin-participants',
          component: () => import('@/views/admin/ParticipantListView.vue'),
          meta: { title: '参与方管理' },
        },
        {
          path: 'notices',
          name: 'admin-notices',
          component: () => import('@/views/admin/NoticeListView.vue'),
          meta: { title: '须知模板' },
        },
        {
          path: 'services',
          name: 'admin-services',
          component: () => import('@/views/admin/ServiceListView.vue'),
          meta: { title: '服务保障' },
        },
        {
          path: 'tickets',
          name: 'admin-tickets',
          component: () => import('@/views/admin/TicketListView.vue'),
          meta: { title: '电子票管理' },
        },
        {
          path: 'tickets',
          name: 'admin-tickets',
          component: () => import('@/views/admin/TicketListView.vue'),
          meta: { title: '电子票管理' },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserListView.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'admins',
          name: 'admin-admins',
          component: () => import('@/views/admin/AdminListView.vue'),
          meta: { title: '管理员管理' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/NotFound.vue'),
      meta: { title: '404' },
    },
  ],
})

router.beforeEach((to, _from) => {
  const userStore = useUserStore()

  if (to.meta.requiresAdmin && !userStore.adminToken) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  } else if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  } else if (to.name === 'login' && userStore.isLoggedIn) {
    return { name: 'home' }
  }
})

export default router
