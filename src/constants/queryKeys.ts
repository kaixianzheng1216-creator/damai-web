import type { Ref } from 'vue'

type QueryKeyPart = string | number | boolean | null | undefined | Ref<unknown>

const key = (...parts: QueryKeyPart[]) => parts

export const queryKeys = {
  admin: {
    list: (name: string) => key(`admin-${name}`),
    detail: (name: string, id?: QueryKeyPart) => key(`admin-${name}-detail`, id),
    eventDetail: (id?: QueryKeyPart) => key('admin-event-detail', id),
    workOrderList: () => key('admin-work-order-list'),
    workOrderDetail: (id?: QueryKeyPart) => key('admin-work-order-detail', id),
  },
  ai: {
    chat: () => key('ai-chat'),
  },
  event: {
    detail: (id?: QueryKeyPart) => key('event-detail', id),
    search: (params: QueryKeyPart) => key('event-search', params),
    cityOptions: () => key('city-options'),
    searchCities: () => key('search-cities'),
    searchCategories: () => key('search-categories'),
    followed: (id?: QueryKeyPart) => key('event-followed', id),
  },
  participant: {
    detail: (id?: QueryKeyPart) => key('participant-detail', id),
    events: (id?: QueryKeyPart, page?: QueryKeyPart) => key('participant-events', id, page),
    followed: (id?: QueryKeyPart) => key('participant-followed', id),
  },
  profile: {
    userInfo: () => key('user-info'),
    passengers: (...parts: QueryKeyPart[]) => key('passenger-list', ...parts),
    orders: (...parts: QueryKeyPart[]) => key('my-order-page', ...parts),
    tickets: (...parts: QueryKeyPart[]) => key('my-ticket-page', ...parts),
    workOrders: (...parts: QueryKeyPart[]) => key('my-work-order-page', ...parts),
    workOrderDetail: (id?: QueryKeyPart) => key('my-work-order-detail', id),
    followedEvents: (...parts: QueryKeyPart[]) => key('followed-events', ...parts),
    followedParticipants: (...parts: QueryKeyPart[]) => key('followed-participants', ...parts),
  },
  trade: {
    order: (id?: QueryKeyPart) => key('ticket-order', id),
    orderStatus: (id?: QueryKeyPart) => key('order-status', id),
    orderDetail: (id?: QueryKeyPart) => key('order-detail', id),
    purchaseCounts: (ticketTypeIds?: QueryKeyPart) => key('purchase-counts', ticketTypeIds),
  },
  ticket: {
    detail: (id?: QueryKeyPart) => key('ticket-detail', id),
  },
  home: {
    banners: () => key('banners'),
    categories: () => key('categories'),
    cities: () => key('cities'),
  },
} as const
