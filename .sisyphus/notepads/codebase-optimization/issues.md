# Codebase Optimization - Issues

## F2 Blockers (2026-05-04)

### 1. Empty catch in useAppConfirmDialog.ts:90

- `catch {}` with no error logging — swallows all onConfirm() exceptions
- Must add `console.error('[useAppConfirmDialog] onConfirm failed:', error)` or pass error up
- Was marked in Task 12 as "intentionally kept without error variable" — needs explicit justification or fix

### 2. Wrong alt texts in AIChatMessageList.vue

- Line 95: `alt="活动封面"` on AI assistant avatar → should be "AI助手头像"
- Line 137: `alt="订单封面"` on user avatar → should be "用户头像"
- Line 151: `alt="电子票封面"` on AI assistant loading avatar → should be "AI助手头像"
- Caused by batch-replace of dynamic `:alt` to static `alt` values without contextual review

### 3. Test assertion mismatch in componentSmoke.test.ts:136

- ProfileInfoSection.vue alt changed from "个人头像" to "用户头像"
- Test still expects `'个人头像'`
- Either update test or keep original alt text

### 4. Prettier formatting needed on 7 files

- DataTableCrud.vue, OrderCard.vue, HeaderUserMenu.vue, ScanCheckinDialog.vue, AIChatEmptyState.vue, ProfileDialogs.vue, ProfileSectionContent.vue
- Run `npm run format` to fix

## Pre-existing (not blockers)

- OpenAPI contract: 119 API calls, 0 documented operations (all endpoints)
- Oxlint: native binding not found for win32-x64-msvc (environment issue)
- 7 apiOpenApiContract tests fail — tests need OpenAPI docs to pass
