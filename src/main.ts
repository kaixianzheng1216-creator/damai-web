import './styles/index.css'
import 'vue3-toastify/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import { QueryClient } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  },
})

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, {
  queryClient,
} as VueQueryPluginOptions)
app.use(Vue3Toastify, {
  autoClose: 3000,
} as ToastContainerOptions)

app.mount('#app')
