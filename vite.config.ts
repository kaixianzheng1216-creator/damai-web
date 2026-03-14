import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteMockServe } from 'vite-plugin-mock'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isMock = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      vueDevTools(),
      viteMockServe({
        mockPath: 'src/mock',
        enable: isMock,
      }),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          '@vueuse/core',
          { '@tanstack/vue-query': ['useQuery', 'useMutation', 'useQueryClient'] },
        ],
        dirs: ['src/stores', 'src/composables', 'src/api'],
        dts: 'src/types/auto-imports.d.ts',
      }),
      Icons({ autoInstall: true }),
      Components({
        resolvers: [IconsResolver({ prefix: 'icon' })],
        dirs: ['src/components'],
        dts: 'src/types/components.d.ts',
      }),
    ],
    server: {
      proxy: isMock
        ? {}
        : {
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
