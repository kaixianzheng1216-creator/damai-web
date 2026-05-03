import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const plugins = [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        { '@tanstack/vue-query': ['useQuery', 'useMutation', 'useQueryClient', 'useQueries'] },
        { zod: ['z'], clsx: ['clsx'], 'tailwind-merge': ['twMerge'] },
      ],
      dirs: ['src/utils', 'src/composables'],
      dts: 'src/types/auto-imports.d.ts',
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components/common/ui', 'src/components/admin', 'src/components/features'],
      resolvers: [IconsResolver({ prefix: 'icon' })],
      dts: 'src/types/components.d.ts',
    }),
    Icons({ autoInstall: true }),
  ]

  if (mode === 'development') {
    plugins.push(vueDevTools() as any)
    plugins.push(basicSsl() as any)
  }

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'happy-dom',
    },
    plugins,
    server: {
      host: true,
      proxy: {
        [env.VITE_API_BASE_URL]: {
          target: env.VITE_API_TARGET_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
