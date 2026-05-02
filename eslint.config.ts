import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/scripts/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  {
    name: 'app/business-no-explicit-any',
    files: ['src/**/*.{vue,ts}'],
    ignores: ['src/components/common/ui/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    name: 'app/dialog-no-vif-with-open',
    files: ['src/**/*.vue'],
    rules: {
      'vue/no-restricted-syntax': [
        'error',
        {
          selector: 'VElement[name=/Dialog/] > VStartTag > VAttribute[name.name="v-if"]',
          message:
            '禁止在 Dialog 组件上使用 v-if，请使用 :open 控制显示。详见 docs/ui-guidelines.md',
        },
      ],
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
