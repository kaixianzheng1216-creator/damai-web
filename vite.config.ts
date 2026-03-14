import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteMockServe } from 'vite-plugin-mock'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      tailwindcss(),
      vueDevTools(),
      viteMockServe({
        mockPath: 'mock',
        enable: true,
      }),
    ],
    server: {
      proxy: {
        [env.VITE_API_BASE_URL]: {
          target: env.VITE_API_TARGET_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API_BASE_URL}`), ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
