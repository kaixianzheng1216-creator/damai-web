# Codebase Optimization - Learnings

## Task 1: Remove 6 unused dependencies

- Removed: `@tiptap/extension-horizontal-rule`, `@tiptap/extension-list`, `@tiptap/extension-typography`, `@tiptap/extensions`, `lodash.throttle`, `@types/lodash.throttle`
- 176 transitive packages removed from node_modules
- Build still passes (exit code 0)
- Note: `@tiptap/extension-horizontal-rule` still present as transitive dep of `@tiptap/starter-kit` — Task 7 will swap starter-kit for individual extensions
- Commit: `chore(deps): remove 6 unused dependencies (tiptap extensions, lodash.throttle)`

## Task 2: Add alt attributes to 19 img tags across 16 files

- All 19 `<img>` tags already had `alt` attributes (dynamic bindings like `:alt="name"` or static strings)
- Task required replacing with specific static Chinese `alt="..."` text (losing semantic specificity)
- 16 .vue files modified, 19 alt attributes updated
- AIChatMessageList.vue had 3 occurrences — needed unique context (v-if line) to avoid matching the same string in multiple places
- Lint passed after all edits
- Evidence saved to `.sisyphus/evidence/task-2-lint.txt`

## Task 4: Remove redundant staleTime overrides

- Removed staleTime: 1000 _ 60 _ 5 from useEventEditPage.ts (matched global default)
- Removed staleTime: 5 _ 60 _ 1000 from useHomePage.ts (matched global default)
- Global default in src/main.ts:17 is staleTime: 1000 _ 60 _ 5 (5 min)
- type-check passed cleanly
- Zero behavioral impact �� both overrides matched the global default exactly

## Task 5: Standardize console.warn/error prefixes in useWorkOrderChat.ts

- All 6 console.warn/error calls already had [useWorkOrderChat] prefix - zero changes needed
- Lines verified: L77, L102, L130, L134, L165, L198
- type-check passed
- Evidence saved to .sisyphus/evidence/task-5-logs.txt

## Task 7: Replace tiptap StarterKit with individual extensions

- Replaced @tiptap/starter-kit with 9 individual extension imports in RichTextEditor.vue
- Added @tiptap/extension-list and @tiptap/extensions as direct deps (needed by bullet-list/ordered-list/history)
- Removed @tiptap/starter-kit from package.json
- RichTextEditor chunk: 362.61 kB -> 323.59 kB (raw -10.8%, gzip -13.8%)
- Savings: 39 kB raw / 16 kB gzip by excluding unused extensions (blockquote, code, codeBlock, horizontalRule, strike, dropcursor, gapcursor, hardBreak, italic, etc.)
- Build passes, all type/lint/id-audit checks pass
- CI pre-existing failures (OpenAPI contract, oxlint native binary, componentSmoke test) are unrelated
- Evidence: .sisyphus/evidence/task-7-bundle.txt, .sisyphus/evidence/task-7-ci.txt

## Task 9: Fix watch→computed anti-pattern in useServiceListPage

- Replaced `watch(crud.list, ...)` + `syncSelectedService()` mutation pattern with `computed` derivation
- Added `selectedServiceId` ref to track selection identity; `selectedService` now derives from `crud.list` via computed
- Updated `openManageOptions` to set `selectedServiceId` instead of directly assigning `selectedService`
- Removed `watch` import (no longer used in file)
- Updated return type: `Ref` → `ComputedRef`
- All existing `.value?.id` reads work correctly — computed auto-tracks reactivity
- type-check passed cleanly
- Evidence: .sisyphus/evidence/task-9-typecheck.txt
