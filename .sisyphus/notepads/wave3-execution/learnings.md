## Wave 3 Documentation Findings

### Auto-Imports Catalog (`docs/auto-imports.md`)

- `unplugin-auto-import` is configured in `vite.config.ts` with imports from: `vue`, `vue-router`, `pinia`, `@vueuse/core`, `@tanstack/vue-query` (useQuery, useMutation, useQueryClient), `zod`, `clsx`, `tailwind-merge`.
- Auto-scanned directories: `src/utils/`, `src/composables/`.
- `unplugin-vue-components` auto-registers components from: `src/components/common/ui/`, `src/components/admin/`, `src/components/features/`.
- Icons are auto-resolved via `IconsResolver({ prefix: 'icon' })` using Lucide icons (e.g. `<icon-lucide-loader2 />`).
- The generated declaration files are `src/types/auto-imports.d.ts` and `src/types/components.d.ts`.
- Note: `useInfiniteQuery` is **not** currently in the auto-import config.

### API Directory Catalog (`docs/api-directory.md`)

- API layer is organized under `src/api/<domain>/`.
- Domains: `account` (auth, user, admin, passenger), `ai`, `event` (event, category, city, venue, banner, series, service, participant, notice, follow), `file`, `ticket`, `trade` (order, payment, workOrder).
- Core infrastructure: `request.ts` (wrapper with auth header injection), `requestTransforms.ts` (response normalization), `types.ts` (shared helpers).
- Naming conventions observed: `fetchXxx` (GET), `createXxx` (POST), `updateXxx` (PUT), `deleteXxx` (DELETE), `publishXxx`/`offlineXxx` (status transitions), `fetchMyXxx` (front user-scoped), `fetchAdminXxx` (admin-scoped).
- Several deprecated aliases exist (e.g. `fetchCategories` → `fetchCategoryList`), kept for backward compatibility.

## Optimize Pinia Stores

### Done

- Extracted common auth persistence logic into `src/composables/common/useAuthStore.ts` via `createAuthStore<T>(tokenKey, infoKey)`.
- `createAuthStore` wraps `useStorage` for token/info and returns a `computed(() => Boolean(token.value))` for `isLoggedIn`.
- Updated `src/stores/user.ts` to use `createAuthStore<UserInfo>('token', 'user-info')`.
- Updated `src/stores/admin.ts` to use `createAuthStore<AdminInfo>('admin-token', 'admin-info')` and now exports `isLoggedIn`.
- Both stores preserve exact public API (same exported names and types).
- Exported new helper from `src/composables/common/index.ts`.
- `type-check` passes; all 93 tests pass (25 test files).

### Gotcha: `userStore.isLoggedIn` was already a computed

`user.ts` originally used `computed(() => !!token.value)`. The refactor switched it to `Boolean(token.value)` inside the shared helper, aligning with the explicit requirement.

### Gotcha: `adminStore` had no `isLoggedIn`

Adding `isLoggedIn` to `admin.ts` is a pure addition; no existing consumers reference `adminStore.isLoggedIn`, so zero breaking changes. Future consumers can now use `adminStore.isLoggedIn` instead of `!!adminStore.adminToken`.

### Gotcha: Different `setXxxInfo` signatures

`setUserInfo` accepts an optional second token argument (falls back to `data.token`), while `setAdminInfo` requires a token string. This prevented a fully generic setter inside `createAuthStore`, so the helper only extracts the reactive state and leaves setter/clear methods in each store.

## Clean TODOs, console.log, and `any` types

### Done

- Removed the only TODO comment in the codebase (`src/components/common/ui/chart/ChartTooltipContent.vue` lines 28-29) along with the commented-out dead code.
- Changed `payload?: Record<string, any>` → `payload?: Record<string, unknown>` in `ChartTooltipContent.vue`.
- Added type guards for `unknown` values:
  - `props.payload['fill']` checked with `typeof rawFill === 'string'` before using as `indicatorColor`.
  - `value.toLocaleString()` replaced with `typeof value === 'number' ? value.toLocaleString() : String(value)`.
  - `props.payload[props.labelKey]` wrapped with `String(...)` for safe interpolation.
- Added `'no-console': ['error', { allow: ['warn', 'error'] }]` to `eslint.config.ts`.
- Added `**/scripts/**` to `globalIgnores` in ESLint config to allow console output in CI scripts (`audit-id-strategy.mjs`, `openapi-contract-report.mjs`).
- Verified zero `console.log` in `src/` via PowerShell `Select-String` across all `.ts`/`.vue`/`.js` files.
- Verified zero `any` types in business code (outside `src/components/common/ui/`) via the same search.
- `type-check` passes; `lint:check` passes; `lint:oxlint` passes (0 warnings, 0 errors).

### Gotcha: ESLint flat config `files` scope

In flat config, a top-level `files` object only restricts that specific config block. The `no-console` rule added to a later block without `files` applied to ALL files (including `.mjs` scripts). Fix: either scope the rule block with `files: ['src/**/*.{vue,ts,mts,tsx}']` or add the scripts directory to `globalIgnores`.

## Unify `defineProps` Style Across Vue Components

### Done

- Removed all 19 `interface Props` definitions from `src/components/**/*.vue` (excluding `src/components/common/ui/`).
- Inlined prop types into `defineProps<{...}>()` or `withDefaults(defineProps<{...}>(), {...})`.
- Files modified:
  - **Admin**: `DataTableCrud.vue`
  - **Common**: `CommonDataTableCrud.vue`, `DateTimePicker.vue`, `ImageUpload.vue`, `RichTextEditor.vue`, `IconAlipay.vue`, `IconWechatPay.vue`
  - **Features**: `BasicTab.vue`, `InfoTab.vue`, `InventoryAdjustDialog.vue`, `ParticipantsTab.vue`, `ServicesTab.vue`, `SessionList.vue`, `SessionsAndTicketsTab.vue`, `TicketTypeCopyDialog.vue`, `TicketTypeDialog.vue`, `HomeBanner.vue`
  - **Templates**: `DialogTemplate.vue`, `FormDialogTemplate.vue`
- Preserved exact prop names, types, and default values in all cases.
- `lint:check` and `type-check` both pass with zero errors.

### Target Style Applied

- Simple components (props ≤ 3, no defaults): inline `defineProps<{...}>()`.
- Complex components (props > 3 or with defaults): inline `withDefaults(defineProps<{...}>(), {...})`.
- No separate `interface Props` remains in any component under `src/components/` (outside shadcn-vue internals).
