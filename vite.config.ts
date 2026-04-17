import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isMock = env.VITE_USE_MOCK === 'true'

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      vue(),
      tailwindcss(),
      vueDevTools(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          '@vueuse/core',
          { '@tanstack/vue-query': ['useQuery', 'useMutation', 'useQueryClient'] },
          { zod: ['z'], clsx: ['clsx'], 'tailwind-merge': ['twMerge'] },
        ],
        dirs: ['src/utils', 'src/composables', 'src/api', 'src/stores'],
        dts: 'src/types/auto-imports.d.ts',
        vueTemplate: true,
      }),
      Components({
        resolvers: [IconsResolver({ prefix: 'icon' })],
        dts: 'src/types/components.d.ts',
      }),
      Icons({ autoInstall: true }),
    ],
    server: {
      proxy: isMock
        ? {}
        : {
            [env.VITE_API_BASE_URL]: {
              target: env.VITE_API_TARGET_URL,
              changeOrigin: true,
            },
          },
    },
  }
})
