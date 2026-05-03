# Architecture Fixes — Vibe Coding Debt Cleanup

## TL;DR

> **Quick Summary**: Fix 12 architecture issues identified as "Vibe Coding" anti-patterns across bundle size, data-fetching, composable architecture, and testing.
>
> **Deliverables**:
>
> - Split `listPageColumns.ts` into per-entity files (tree-shaking + decoupling)
> - Dynamic import `@zxing/browser` (-407KB initial bundle)
> - Migrate `useHomePage.ts` from manual fetch to TanStack Query `useQueries`
> - Unify Banner/Service CRUD into `useAdminCrud` (~130 lines eliminated)
> - Remove `useProfilePage` pass-through aggregator
> - Refactor `useEventTicketSelection` 5-watcher cascade to state reducer
> - Fix `AIChatMessageList` `:key="index"` on dynamic messages
> - Optimize `useAIChat` array clone (O(n) → O(1))
> - Dynamic import `@stomp/stompjs` (-40KB main bundle)
> - Add tests for 7 critical untested files (format, mappers, statusMappers, useDialog, useCountdown, createAuthStore, useFollowToggle)
> - Add edge case tests to 4 existing test suites (checkout, login, eventEditFlows, componentSmoke)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Wave 1 tests → Wave 2 refactor → Wave 3 bundle → Wave FINAL review

---

## Context

### Original Request

用户希望进一步发掘 Vibe Coding 存在的架构问题，并一次性修复全部发现的问题。

### Interview Summary

**Key Discussions**:

- 3 个并行探索代理完成了深度扫描（架构审计、测试覆盖分析、性能审计）
- 手动审查补充了额外的架构问题
- 用户要求一次性生成包含全部修复的工作计划
- 前期 6 波清理工作已完成（死代码删除、组件提取、导入统一等）

**Research Findings**:

- Build output: ScanCheckinDialog chunk 407KB, RichTextEditor 354KB, index 181KB
- 25 test files exist but ~45 composables total = 44% gap
- Two incompatible mock patterns side by side (vi.mock vs vi.doMock)
- No skipped tests found
- type-check passes, lint passes, build passes
- OpenAPI report and 1 test file have pre-existing failures

### Metis Review

**Identified Gaps** (addressed):

- **Execution order**: Issues form dependency graph — tests must come before refactor, bundle optimization last
- **Characterization tests**: MUST write tests of CURRENT behavior before refactoring composables
- **Scope boundaries**: Many tempting areas (RichTextEditor, all CRUD composables, all :key fixes) locked OUT
- **Dynamic import UX**: Loading/error states for async chunks must be designed
- **Assumptions validated**: `useAdminCrud` extension backward-compat, `ChatMessage` ID generation, stomp singleton pattern

---

## Work Objectives

### Core Objective

Eliminate Vibe Coding architecture debt across 4 dimensions: bundle bloat, data-fetching inconsistencies, composable duplication/god-objects, and test coverage gaps.

### Concrete Deliverables

1. `src/components/admin/columns/` — per-entity column definition files
2. `src/components/admin/columns/columnUtils.ts` — shared column helpers
3. `ScanCheckinDialog.vue` — dynamic `@zxing/browser` import with loading/error states
4. `useHomePage.ts` — migrated to `useQueries` pattern
5. `useBannerListPage.ts` + `useServiceListPage.ts` — migrated to `useAdminCrud`
6. `ProfileView.vue` — imports sub-composables directly, `useProfilePage.ts` removed
7. `useEventTicketSelection.ts` — state reducer replacing 5 watchers
8. `AIChatMessageList.vue` — stable `:key` using composite key
9. `useWorkOrderChat.ts` — dynamic `@stomp/stompjs` import
10. 7 new test files + 4 augmented test files

### Definition of Done

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint:check` → 0 new errors
- [ ] `npm run build` → succeeds, chunk sizes verified
- [ ] `npm run test` → all pass (excluding 1 pre-existing failure)
- [ ] Pre-existing OpenAPI report failure still fails (not accidentally fixed)
- [ ] No new `audit:ids` violations

### Must Have

- All changes pass type-check, lint, build
- Existing functionality preserved (characterization tests prove parity)
- File moves/renames accepted if functionality unchanged

### Must NOT Have (Guardrails)

- **NO API contract changes** — API functions, response types, query key structures off-limits
- **NO router restructure** — Route definitions, layout assignments, meta flags unchanged
- **NO state management core change** — `user.ts` and `admin.ts` Pinia stores remain as-is
- **NO shadcn UI component modification** — `/common/ui/` components are sacred
- **NO OpenAPI doc changes** — `docs/openapi/` untouched
- **NO RichTextEditor optimization** — Already correctly lazy-loaded
- **NO fixing pre-existing test/OpenAPI failures** — Documented but out of scope
- **NO :key fixes on low-risk lists** — Only AIChatMessageList (high-priority)
- **NO tests for ALL 47 untested composables** — Only 7 critical files + 4 edge case augmentations

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: YES (Vitest + @vue/test-utils + happy-dom)
- **Automated tests**: YES (Tests after) — New tests written before/during refactor, existing tests augmented
- **Framework**: vitest
- **Mock pattern**: Standardize on `vi.mock` + `vi.hoisted` (Pattern A)

### QA Policy

Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun test) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — safe structural + test foundation):
├── T1:  Split listPageColumns.ts into per-entity files [unspecified-high]
├── T2:  Fix useAIChat array clone O(n) → O(1) [quick]
├── T3:  Document dayjs locale decision (keep as-is) [quick]
├── T4:  Test format.ts — 7 pure functions [quick]
├── T5:  Test statusMappers.ts — 4 status→CSS mappers [quick]
├── T6:  Test mappers.ts — 3 VO→DTO mappers [quick]
├── T7:  Test useDialog.ts — core dialog state manager [quick]
├── T8:  Test useCountdown.ts — interval timer [quick]
├── T9:  Test createAuthStore.ts — auth store factory [quick]
└── T10: Test useFollowToggle.ts — follow/unfollow with auth guard [quick]

Wave 2 (After Wave 1 — architecture refactor with safety net):
├── T11: Remove useProfilePage pass-through, wire view directly [unspecified-high]
├── T12: Migrate Banner/Service CRUD to useAdminCrud [unspecified-high]
├── T13: Migrate useHomePage manual fetch → useQueries [deep]
├── T14: Refactor useEventTicketSelection watchers → reducer [deep]
├── T15: Fix AIChatMessageList :key="index" → stable key [quick]
├── T16: Add edge cases to useCheckoutPage test [quick]
├── T17: Add edge cases to useLoginPage test [quick]
├── T18: Add update/delete to eventEditFlows test [quick]
└── T19: Fix componentSmoke DialogStub v-if → :open [quick]

Wave 3 (After Wave 2 — bundle optimization):
├── T20: Dynamic import @zxing/browser in ScanCheckinDialog [unspecified-high]
├── T21: Dynamic import @stomp/stompjs in useWorkOrderChat [unspecified-high]
└── T22: Build verification + chunk size audit [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1-T10 → T11-T19 → T20-T22 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 10 (Wave 1)
```

### Dependency Matrix

| Task    | Blocked By | Blocks |
| ------- | ---------- | ------ |
| T1      | —          | T12    |
| T2      | —          | T15    |
| T3      | —          | —      |
| T4-T10  | —          | —      |
| T11     | T4-T10     | —      |
| T12     | T1         | —      |
| T13     | T4-T10     | —      |
| T14     | T4-T10     | —      |
| T15     | T2         | —      |
| T16-T19 | T4-T10     | —      |
| T20-T22 | T11-T19    | —      |
| F1-F4   | T20-T22    | —      |

### Agent Dispatch Summary

- **Wave 1**: **10** tasks — T1 → `unspecified-high`, T2-T10 → `quick`
- **Wave 2**: **9** tasks — T11-T12 → `unspecified-high`, T13-T14 → `deep`, T15-T19 → `quick`
- **Wave 3**: **3** tasks — T20-T21 → `unspecified-high`, T22 → `quick`
- **FINAL**: **4** tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. **Split listPageColumns.ts into per-entity column files**

  **What to do**:
  - Create `src/components/admin/columns/columnUtils.ts` with shared helpers: `stopAndRun`, `actionButton`, `actionGroup`, `editDeleteActions`, `accountStatusBadge`, `accountAvatarCell`
  - Create per-entity files:
    - `eventColumns.ts` — `createEventColumns` + `createSeriesEventColumns`
    - `adminColumns.ts` — `createAdminColumns`
    - `userColumns.ts` — `createUserColumns`
    - `workOrderColumns.ts` — `createWorkOrderColumns`
    - `bannerColumns.ts` — `createBannerColumns`
    - `categoryColumns.ts` — `createCategoryColumns`
    - `cityColumns.ts` — `createCityColumns`
    - `venueColumns.ts` — `createVenueColumns`
    - `noticeColumns.ts` — `createNoticeColumns`
    - `participantColumns.ts` — `createParticipantColumns`
    - `ticketColumns.ts` — `createTicketColumns`
    - `orderColumns.ts` — `createOrderColumns`
    - `serviceColumns.ts` — `createServiceColumns`
  - Update all importers to import from new per-entity paths
  - Delete `listPageColumns.ts`

  **Must NOT do**:
  - Do NOT change any column definition logic (keep identical cell renderers, sizes, headers)
  - Do NOT create new column types or add new columns
  - Do NOT change the function signatures of exported column creators

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires careful migration of 15+ import sites, high risk of breaking imports
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: Ensures composable patterns and TypeScript conventions are followed during file restructuring

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2-T10)
  - **Parallel Group**: Wave 1
  - **Blocks**: T12 (Banner/Service migration imports from new column paths)
  - **Blocked By**: None

  **References**:
  - `src/components/admin/listPageColumns.ts:1-753` — Current monolithic file, study all exports and their patterns
  - `src/components/admin/listPageColumns.ts:38-56` — Shared helpers to extract
  - Importers: search for `from '@/components/admin/listPageColumns'` across codebase

  **Acceptance Criteria**:
  - [ ] `npm run type-check` passes with zero errors
  - [ ] `npm run lint:check` passes with zero new errors
  - [ ] Every reference to `listPageColumns.ts` is removed from codebase
  - [ ] All admin list views render identically (no missing columns or broken actions)

  **QA Scenarios**:

  ```
  Scenario: Admin event list columns render correctly after split
    Tool: Playwright
    Preconditions: Logged in as admin, on /admin/events
    Steps:
      1. Navigate to /admin/events
      2. Assert table has columns: 活动名称, 城市, 分类, 场馆, 关注人数, 状态, 推荐权重, 操作
      3. Assert "操作" column has buttons: 编辑, 发布, 删除 (for draft events)
      4. Screenshot: .sisyphus/evidence/task-1-event-columns.png
    Expected Result: All columns visible, action buttons clickable, no console errors
    Failure Indicators: Missing columns, broken action buttons, TypeScript import errors
    Evidence: .sisyphus/evidence/task-1-event-columns.png
  ```

  **Commit**: YES
  - Message: `refactor(columns): split monolithic listPageColumns into per-entity files`
  - Files: `src/components/admin/columns/*`, all updated importers
  - Pre-commit: `npm run type-check`

---

- [x] 2. **Fix useAIChat array clone O(n) → O(1)**

  **What to do**:
  - In `src/composables/ai/useAIChat.ts` line ~91, replace `[...messages.value].reverse().find(...)` with an efficient reverse search
  - Use `messages.value.toReversed?.().find(...)` or manual reverse loop without cloning
  - Ensure identical behavior: returns suggestions from the most recent AI message

  **Must NOT do**:
  - Do NOT change the `lastSuggestions` computed return type
  - Do NOT change any other logic in the composable

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-line performance fix, minimal risk

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1, T3-T10)
  - **Parallel Group**: Wave 1
  - **Blocks**: T15 (AIChatMessageList key fix — related but independent)
  - **Blocked By**: None

  **References**:
  - `src/composables/ai/useAIChat.ts:90-93` — Current O(n) clone pattern

  **Acceptance Criteria**:
  - [ ] `[...messages.value]` pattern removed from useAIChat.ts
  - [ ] `lastSuggestions` returns identical results for all input message arrays
  - [ ] `npm run test -- src/composables/ai/__tests__/useAIChat.test.ts` passes

  **QA Scenarios**:

  ```
  Scenario: lastSuggestions returns correct suggestions without array clone
    Tool: Bash (bun test)
    Preconditions: useAIChat.test.ts exists and passes
    Steps:
      1. Run `npm run test -- src/composables/ai/__tests__/useAIChat.test.ts`
      2. Assert: all tests pass
      3. Assert: no `[...messages.value]` pattern in useAIChat.ts
    Expected Result: Tests pass, grep for clone pattern returns empty
    Evidence: .sisyphus/evidence/task-2-ai-clone-fix.txt
  ```

  **Commit**: YES (groups with T3)
  - Message: `perf(ai): eliminate array clone in lastSuggestions computed`
  - Files: `src/composables/ai/useAIChat.ts`

---

- [x] 3. **Document dayjs locale decision (accept as-is)**

  **What to do**:
  - Add a code comment in `src/utils/format.ts` explaining why `import 'dayjs/locale/zh-cn'` is a global side-effect and acceptable for a Chinese-language platform
  - The import is ~4KB and used by `formatDateTimeWithWeekday` — acceptable trade-off
  - No code changes needed; just document the architectural decision

  **Must NOT do**:
  - Do NOT change the import pattern
  - Do NOT switch to per-instance locale (unnecessary complexity for this project)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Documentation-only task, zero risk

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T2, T4-T10)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/utils/format.ts:1-5` — Current dayjs import

  **Acceptance Criteria**:
  - [ ] Comment added near `import 'dayjs/locale/zh-cn'` explaining the trade-off

  **Commit**: YES (groups with T2)
  - Message: `docs(utils): document dayjs locale global import decision`
  - Files: `src/utils/format.ts`

---

- [x] 4. **Test format.ts — 7 pure formatting functions**

  **What to do**:
  - Create `src/utils/__tests__/format.test.ts`
  - Test all 7 functions with happy paths and edge cases:
    - `formatPrice`: 0, positive, negative, null/undefined
    - `formatPriceRange`: same min/max, different, null
    - `formatDateTimeWithWeekday`: valid date, null, edge dates
    - `formatDateTime`: valid, null, ISO string
    - `formatDateTimeLocalInput`: valid, null
    - `formatDate`: valid, null
    - `formatDateTimeRange`: same day, different days, null start/end
  - Use `vi.useFakeTimers()` where needed for date-dependent assertions

  **Must NOT do**:
  - Do NOT test internal dayjs behavior (test OUR formatting logic, not dayjs itself)
  - Do NOT mock dayjs (test real formatting)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure functions, zero mocking complexity
  - **Skills**: [`vue-testing-best-practices`]
    - `vue-testing-best-practices`: Vitest patterns for utility testing

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T3, T5-T10)
  - **Parallel Group**: Wave 1
  - **Blocks**: None (pure utility, no downstream deps)
  - **Blocked By**: None

  **References**:
  - `src/utils/format.ts:1-60` — All formatting functions
  - `src/utils/__tests__/aiChatPrompt.test.ts` — Example utility test pattern

  **Acceptance Criteria**:
  - [ ] Test file created: `src/utils/__tests__/format.test.ts`
  - [ ] `npm run test -- src/utils/__tests__/format.test.ts` passes (≥14 test cases)
  - [ ] Coverage: all 7 functions tested, edge cases included

  **QA Scenarios**:

  ```
  Scenario: formatPrice handles all edge cases
    Tool: Bash (bun test)
    Preconditions: format.test.ts created
    Steps:
      1. Run `npm run test -- src/utils/__tests__/format.test.ts`
      2. Assert: all tests pass (≥14 cases)
      3. Assert: no `[...]` clone patterns in format.ts (not applicable here)
    Expected Result: 14+ tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-4-format-test.txt
  ```

  **Commit**: YES (groups with T5-T7)
  - Message: `test(utils): add tests for format.ts pure functions`
  - Files: `src/utils/__tests__/format.test.ts`

---

- [x] 5. **Test statusMappers.ts — 4 status→CSS mapping functions**

  **What to do**:
  - Create `src/utils/__tests__/statusMappers.test.ts`
  - Test all 4 functions:
    - `mapOrderStatus`: all status codes → expected CSS classes + labels
    - `getTicketStatusClass`: all ticket status codes
    - `getOrderStatusBadgeClass`: all order status codes
    - `getWorkOrderStatusBadgeClass`: all work order status codes
  - Include edge case: unknown status code → default/fallback behavior
  - The CLOSED→CANCELLED mapping is a non-obvious business rule — test it explicitly

  **Must NOT do**:
  - Do NOT change the mapping logic (only test existing behavior)

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T4, T6-T10)
  - **Parallel Group**: Wave 1

  **References**:
  - `src/utils/statusMappers.ts` — All mapping functions

  **Acceptance Criteria**:
  - [ ] Test file: `src/utils/__tests__/statusMappers.test.ts`
  - [ ] All status codes covered (including edge/unknown)
  - [ ] `npm run test -- src/utils/__tests__/statusMappers.test.ts` passes

  **QA Scenarios**:

  ```
  Scenario: All status mappers return correct CSS classes
    Tool: Bash (bun test)
    Steps:
      1. Run `npm run test -- src/utils/__tests__/statusMappers.test.ts`
      2. Assert: all tests pass (≥12 cases)
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-5-status-mappers-test.txt
  ```

  **Commit**: YES (groups with T4, T6, T7)

---

- [x] 6. **Test mappers.ts — 3 VO→DTO mapping functions**

  **What to do**:
  - Create `src/utils/__tests__/mappers.test.ts`
  - Test:
    - `mapPassengerToPassengerItem`: full data, missing optional fields
    - `convertEventVOToCardItem`: full data, missing poster/category
    - `convertCategoryVOToHomeItem`: all category types + iconMap fallback to 'Ticket'
  - Include the `undefined` key fallback in `iconMap` — test it explicitly

  **Must NOT do**:
  - Do NOT change mapping logic

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T5, T7-T10)
  - **Parallel Group**: Wave 1

  **References**:
  - `src/utils/mappers.ts` — All mapper functions

  **Acceptance Criteria**:
  - [ ] Test file: `src/utils/__tests__/mappers.test.ts`
  - [ ] All 3 mappers covered with edge cases
  - [ ] `npm run test -- src/utils/__tests__/mappers.test.ts` passes

  **Commit**: YES (groups with T4-T7)

---

- [x] 7. **Test useDialog.ts — core dialog state manager**

  **What to do**:
  - Create `src/composables/common/__tests__/useDialog.test.ts`
  - Test all behaviors:
    - `openDialog(data)` sets `open=true` and `data`
    - `closeDialog()` sets `open=false` and clears `data`
    - `withLoading()` wraps async function, sets `isLoading`, clears on success/error
    - `withLoading()` `finally` block ensures `isLoading` resets even on throw
    - `onOpen`/`onClose` callbacks fire correctly
    - Data is shallow reactive (not deep)

  **Must NOT do**:
  - Do NOT change useDialog.ts implementation (only test existing behavior)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T6, T8-T10)
  - **Parallel Group**: Wave 1

  **References**:
  - `src/composables/common/useDialog.ts` — Dialog state manager
  - `src/composables/common/__tests__/useQueryEnabled.test.ts` — Example composable test

  **Acceptance Criteria**:
  - [ ] Test file: `src/composables/common/__tests__/useDialog.test.ts`
  - [ ] `npm run test -- src/composables/common/__tests__/useDialog.test.ts` passes (≥8 cases)

  **QA Scenarios**:

  ```
  Scenario: withLoading resets isLoading on error
    Tool: Bash (bun test)
    Steps:
      1. Create dialog with useDialog<string>()
      2. Call dialog.withLoading(() => Promise.reject(new Error('fail')))
      3. Assert: dialog.isLoading.value is false after rejection
    Expected Result: isLoading resets to false even on error
    Evidence: .sisyphus/evidence/task-7-dialog-loading-test.txt
  ```

  **Commit**: YES (groups with T4-T6, T8)

---

- [x] 8. **Test useCountdown.ts — interval timer**

  **What to do**:
  - Create `src/composables/common/__tests__/useCountdown.test.ts`
  - Test:
    - `start(duration)` begins countdown from correct value
    - Timer decrements every second (use `vi.useFakeTimers()` + `vi.advanceTimersByTime(1000)`)
    - `stop()` pauses countdown
    - `start()` after `stop()` resumes correctly
    - Countdown reaches 0, `isRunning` becomes false
    - Cleanup on unmount (no interval leaks)

  **Must NOT do**:
  - Do NOT change useCountdown.ts implementation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T7, T9-T10)
  - **Parallel Group**: Wave 1

  **References**:
  - `src/composables/common/useCountdown.ts` — Countdown timer

  **Acceptance Criteria**:
  - [ ] Test file: `src/composables/common/__tests__/useCountdown.test.ts`
  - [ ] `npm run test -- src/composables/common/__tests__/useCountdown.test.ts` passes (≥6 cases)

  **QA Scenarios**:

  ```
  Scenario: Countdown reaches zero correctly
    Tool: Bash (bun test)
    Steps:
      1. const { remaining, start } = useCountdown()
      2. start(5)
      3. vi.advanceTimersByTime(5000)
      4. Assert: remaining.value === 0
      5. Assert: isRunning.value === false
    Expected Result: Timer stops at 0
    Evidence: .sisyphus/evidence/task-8-countdown-zero.txt
  ```

  **Commit**: YES (groups with T7, T9-T10)

---

- [x] 9. **Test createAuthStore.ts — auth store factory**

  **What to do**:
  - Create `src/composables/common/__tests__/createAuthStore.test.ts`
  - Test:
    - Factory creates store with correct token/info refs
    - `isLoggedIn` is true when token exists
    - Token persists to localStorage via `@vueuse/core` `useStorage`
    - Clearing token removes from localStorage
    - Store recreation reads persisted token
  - Mock `localStorage` using happy-dom's built-in support

  **Must NOT do**:
  - Do NOT change createAuthStore.ts implementation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T8, T10)
  - **Parallel Group**: Wave 1

  **References**:
  - `src/composables/common/createAuthStore.ts` — Auth store factory
  - `src/stores/user.ts` — Consumer example

  **Acceptance Criteria**:
  - [ ] Test file: `src/composables/common/__tests__/createAuthStore.test.ts`
  - [ ] `npm run test -- src/composables/common/__tests__/createAuthStore.test.ts` passes (≥5 cases)

  **QA Scenarios**:

  ```
  Scenario: Auth store persists token across re-creation
    Tool: Bash (bun test)
    Steps:
      1. Create auth store, set token to 'test-token-123'
      2. Create NEW auth store instance with same key
      3. Assert: newStore.token.value === 'test-token-123'
    Expected Result: Token persisted via useStorage/localStorage
    Evidence: .sisyphus/evidence/task-9-auth-store-persist.txt
  ```

  **Commit**: YES (groups with T7-T8, T10)

---

- [x] 10. **Test useFollowToggle.ts — follow/unfollow with auth guard**

  **What to do**:
  - Create `src/composables/common/__tests__/useFollowToggle.test.ts`
  - Test:
    - Logged-out user: toggle triggers router redirect, no API call
    - Logged-in user: follow mutation fires, query invalidated
    - Rapid toggle: handles API race conditions (follow then unfollow before response)
    - Optimistic update: UI reflects change before API responds
  - Mock `useUserStore`, `useMutation`, `useQueryClient`, `useRouter`
  - Use `vi.mock` + `vi.hoisted` pattern (Pattern A)

  **Must NOT do**:
  - Do NOT change useFollowToggle.ts implementation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T9)
  - **Parallel Group**: Wave 1

  **References**:
  - `src/composables/common/useFollowToggle.ts` — Follow toggle composable
  - `src/composables/common/__tests__/useQueryEnabled.test.ts` — Example test with mock pattern

  **Acceptance Criteria**:
  - [ ] Test file: `src/composables/common/__tests__/useFollowToggle.test.ts`
  - [ ] `npm run test -- src/composables/common/__tests__/useFollowToggle.test.ts` passes (≥6 cases)

  **QA Scenarios**:

  ```
  Scenario: Rapid follow/unfollow handles race condition
    Tool: Bash (bun test)
    Steps:
      1. Mock follow API to resolve after 100ms
      2. Call toggleFollow() (triggers follow)
      3. Immediately call toggleFollow() again (triggers unfollow)
      4. Advance timers by 200ms
      5. Assert: final state matches the last action (unfollowed)
    Expected Result: No state corruption from out-of-order responses
    Evidence: .sisyphus/evidence/task-10-follow-race.txt
  ```

  **Commit**: YES (groups with T7-T9)

---

- [x] 11. **Remove useProfilePage pass-through, wire view directly**

  **What to do**:
  - Read `ProfileView.vue` and identify all properties consumed from `useProfilePage()`
  - Read `useProfilePage.ts` to see which sub-composables provide each property
  - Update `ProfileView.vue` to import sub-composables directly:
    - `useProfileSection` — for section/tab management
    - `useProfileUserInfo` — for user info
    - `usePassengerManagement` — for passenger CRUD
    - `useOrderList` — for orders
    - `useTicketList` — for tickets
    - `useWorkOrderList` — for work orders
    - `useFollowList` — for follows
  - Delete `useProfilePage.ts`
  - Remove `provideProfilePage()` / `injectProfilePage()` if they exist
  - Each profile sub-view/section should obtain its own composable independently

  **Must NOT do**:
  - Do NOT change any UI layout or styling
  - Do NOT change the behavior of any sub-composable
  - Do NOT create new composables (only remove the aggregator)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: High-touch refactor across multiple files, requires careful mapping of 80+ properties
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T12-T19)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T4-T10 (characterization tests provide safety net)

  **References**:
  - `src/composables/profile/useProfilePage.ts` — The pass-through to remove
  - `src/views/profile/ProfileView.vue` — View that consumes useProfilePage
  - `src/composables/profile/useProfileSection.ts` — Sub-composable example
  - `src/composables/profile/usePassengerManagement.ts` — Sub-composable example

  **Acceptance Criteria**:
  - [ ] `useProfilePage.ts` deleted
  - [ ] `ProfileView.vue` imports sub-composables directly
  - [ ] `npm run type-check` passes
  - [ ] `npm run test` passes (profile tests still pass)
  - [ ] Profile page renders identically (all tabs, lists, dialogs work)

  **QA Scenarios**:

  ```
  Scenario: Profile page all sections render after pass-through removal
    Tool: Playwright
    Preconditions: Logged in as user, on /profile
    Steps:
      1. Navigate to /profile
      2. Assert: "个人信息" tab is active by default
      3. Click "我的订单" tab → assert order list renders
      4. Click "乘车人" tab → assert passenger list renders
      5. Click "我的票券" tab → assert ticket list renders
      6. Screenshot: .sisyphus/evidence/task-11-profile-tabs.png
    Expected Result: All tabs load correctly, no console errors
    Failure Indicators: Blank tab content, missing data, TypeScript errors
    Evidence: .sisyphus/evidence/task-11-profile-tabs.png
  ```

  **Commit**: YES
  - Message: `refactor(profile): remove useProfilePage pass-through aggregator`
  - Files: `src/views/profile/ProfileView.vue`, `src/composables/profile/useProfilePage.ts` (deleted)
  - Pre-commit: `npm run type-check && npm run test -- src/composables/profile`

---

- [x] 12. **Migrate Banner/Service CRUD to useAdminCrud**

  **What to do**:
  - Refactor `useBannerListPage.ts` to use `useAdminCrud` instead of manual `useBannerList` + `useBannerDialog`
  - Refactor `useServiceListPage.ts` to use `useAdminCrud` instead of manual `useServiceList` + `useServiceDialog` + `useServiceOptions`
  - Keep any custom logic (e.g., Banner delete dependency check) by providing custom `deleteItem` or `getDeleteConfirmMessage`
  - Update `BannerListView.vue` and `ServiceListView.vue` to use the refactored composables
  - Delete `useBannerList.ts`, `useBannerDialog.ts`, `useServiceList.ts`, `useServiceDialog.ts`, `useServiceOptions.ts` if they become unused

  **Must NOT do**:
  - Do NOT change Banner/Service API calls
  - Do NOT change the column definitions (already in per-entity files from T1)
  - Do NOT change the dialog form fields

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex migration of two non-trivial CRUD patterns into a generic abstraction
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11, T13-T19)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T1 (column files split, new import paths available)

  **References**:
  - `src/composables/admin/list-pages/useBannerListPage.ts` — Current manual pattern
  - `src/composables/admin/list-pages/useServiceListPage.ts` — Current manual pattern
  - `src/composables/admin/common/useAdminCrud.ts` — Target abstraction
  - `src/composables/admin/list-pages/useCategoryListPage.ts` — Example of useAdminCrud migration

  **Acceptance Criteria**:
  - [ ] Banner list: create, edit, delete work identically
  - [ ] Service list: create, edit, delete work identically
  - [ ] `npm run type-check` passes
  - [ ] `npm run test -- src/composables/admin/list-pages/__tests__/useBannerListPage.test.ts` passes
  - [ ] Dead composable files deleted

  **QA Scenarios**:

  ```
  Scenario: Banner CRUD operations after migration
    Tool: Playwright
    Preconditions: Admin logged in, on /admin/banners
    Steps:
      1. Click "新建" → fill form → submit → assert new banner appears in list
      2. Click "编辑" on a banner → modify → submit → assert updated
      3. Click "删除" → confirm → assert banner removed
    Expected Result: All CRUD operations work, no console errors
    Evidence: .sisyphus/evidence/task-12-banner-crud.png
  ```

  **Commit**: YES
  - Message: `refactor(admin): migrate Banner and Service CRUD to useAdminCrud`
  - Files: `src/composables/admin/list-pages/useBannerListPage.ts`, `src/composables/admin/list-pages/useServiceListPage.ts`, related views, deleted dead files

---

- [x] 13. **Migrate useHomePage manual fetch → useQueries**

  **What to do**:
  - Write characterization tests for CURRENT `useHomePage.ts` behavior FIRST
    - Test `eventSections` computed output shape
    - Test `cityList`, `categoryList`, `bannerList` query behavior
    - Test manual `ref<Map>` `categoryEventMap` behavior
  - Then refactor:
    - Replace `fetchCategoryEvents()` manual loop with `useQueries` (one query per category)
    - Replace `ref<Map>` and `ref<Set>` with TanStack Query results
    - Keep `eventSections` computed but derive from query results instead of manual Map
    - Remove `loadingCategories` ref (use `useQueries` built-in isLoading)
    - Ensure identical data shape in `eventSections`

  **Must NOT do**:
  - Do NOT change the `eventSections` output shape (views depend on it)
  - Do NOT change the home page API calls
  - Do NOT change the UI layout

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex state machine migration requiring behavior parity proof
  - **Skills**: [`vue-best-practices`, `vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T12, T14-T19)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T4-T10 (tests provide safety net)

  **References**:
  - `src/composables/home/useHomePage.ts:66-116` — Manual fetch loop to replace
  - `src/views/home/HomeView.vue` — Consumer of useHomePage
  - TanStack Query `useQueries` docs: `https://tanstack.com/query/latest/docs/framework/vue/guides/parallel-queries`

  **Acceptance Criteria**:
  - [ ] Characterization tests pass against OLD code
  - [ ] Same characterization tests pass against NEW code
  - [ ] `fetchEventPage` only called inside `queryFn` (no raw fetch loop)
  - [ ] `ref<Map>` and `ref<Set>` for category events removed
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: Home page loads all category sections after migration
    Tool: Playwright
    Preconditions: On home page /
    Steps:
      1. Navigate to /
      2. Wait for loading to complete
      3. Assert: banner carousel renders
      4. Assert: city list renders
      5. Assert: category tabs render
      6. Assert: at least one category section with events renders
      7. Assert: no duplicate API calls in network tab (check for duplicate /front/events/page)
      8. Screenshot: .sisyphus/evidence/task-13-home-page.png
    Expected Result: All sections load, no duplicate requests, no console errors
    Failure Indicators: Missing sections, duplicate API calls, blank content
    Evidence: .sisyphus/evidence/task-13-home-page.png
  ```

  **Commit**: YES
  - Message: `refactor(home): migrate useHomePage to TanStack Query useQueries`
  - Files: `src/composables/home/useHomePage.ts`, `src/views/home/HomeView.vue`, new test file

---

- [x] 14. **Refactor useEventTicketSelection watchers → state reducer**

  **What to do**:
  - Write characterization tests for CURRENT 5-watcher behavior FIRST
    - Test all state transitions: detail change → session change → ticket type change → quantity change → passenger selection
    - Test user-initiated mutations during derivation (race conditions)
    - Test `immediate: true` behavior on mount
  - Then refactor:
    - Combine 5 interdependent watchers into a single `watchEffect` or explicit state reducer
    - Ensure identical final state for every input combination
    - Preserve user-initiated action priority over derived state
    - The reducer pattern: action → compute next state → assign all refs atomically

  **Must NOT do**:
  - Do NOT change any API calls
  - Do NOT change the public API of the composable (returned refs must have same names/types)
  - Do NOT change the EventDetailView template

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Most complex refactor — state machine with circular dependencies
  - **Skills**: [`vue-best-practices`, `vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T13, T15-T19)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T4-T10 (tests provide safety net)

  **References**:
  - `src/composables/event/useEventTicketSelection.ts:68-131` — 5 watcher cascade
  - `src/composables/event/__tests__/useEventTicketSelection.test.ts` — Existing tests

  **Acceptance Criteria**:
  - [ ] Characterization tests pass against OLD code
  - [ ] Same characterization tests pass against NEW code
  - [ ] All 5 `watch(..., { immediate: true })` removed
  - [ ] New state reducer produces identical `selectedSessionId`, `selectedTicketTypeId`, `ticketQuantity`, `selectedPassengerIds` for 10+ input scenarios
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: Ticket selection state transitions after refactor
    Tool: Bash (bun test)
    Steps:
      1. Run characterization tests: `npm run test -- src/composables/event/__tests__/useEventTicketSelection.test.ts`
      2. Assert: all tests pass (including new characterization tests)
      3. Assert: no `watch(` patterns remain in useEventTicketSelection.ts
    Expected Result: 100% behavior parity, no watcher cascade
    Evidence: .sisyphus/evidence/task-14-ticket-selection-test.txt
  ```

  **Commit**: YES
  - Message: `refactor(event): replace watcher cascade with state reducer in ticket selection`
  - Files: `src/composables/event/useEventTicketSelection.ts`, augmented test file

---

- [x] 15. **Fix AIChatMessageList :key="index" → stable key**

  **What to do**:
  - In `AIChatMessageList.vue`, change `:key="index"` to a stable composite key
  - `ChatMessage` has no `id` field — use composite key: `` `${msg.role}-${index}-${msg.content.slice(0, 20)}-${msg.createAt ?? Date.now()}` ``
  - Or add a client-side generated `messageId` on message creation in `useAIChat.ts`
  - Ensure no duplicate key warnings in console
  - Verify scroll position preserved when new messages arrive

  **Must NOT do**:
  - Do NOT change the `ChatMessage` type if it's sent to the server (check API contract)
  - Do NOT change message rendering logic
  - Do NOT add server-side `id` field (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T14, T16-T19)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T2 (AIChat array clone fix — related file)

  **References**:
  - `src/components/features/ai/AIChatMessageList.vue:87-88` — Current :key="index"
  - `src/composables/ai/useAIChat.ts` — Message creation (where to add client-side id)

  **Acceptance Criteria**:
  - [ ] `:key="index"` removed from AIChatMessageList.vue
  - [ ] Stable composite key used, no console warnings
  - [ ] `npm run test -- src/composables/ai/__tests__/useAIChat.test.ts` passes

  **QA Scenarios**:

  ```
  Scenario: Chat messages have stable keys
    Tool: Playwright
    Preconditions: On /ai (AI chat page)
    Steps:
      1. Send 3 messages
      2. Open browser console, filter for "duplicate key"
      3. Assert: no duplicate key warnings
      4. Send 2 more messages
      5. Assert: scroll position stays at bottom
      6. Screenshot: .sisyphus/evidence/task-15-chat-keys.png
    Expected Result: No key warnings, smooth scroll behavior
    Evidence: .sisyphus/evidence/task-15-chat-keys.png
  ```

  **Commit**: YES (groups with T16-T19)
  - Message: `fix(ai): use stable keys for AIChatMessageList`
  - Files: `src/components/features/ai/AIChatMessageList.vue`, `src/composables/ai/useAIChat.ts`

---

- [x] 16. **Add edge cases to useCheckoutPage test**

  **What to do**:
  - Augment `src/composables/trade/__tests__/useCheckoutPage.test.ts`
  - Add tests for:
    - `isPaid` watcher: when order status becomes PAID, auto-redirect to order detail
    - `isPending` guard on `createPayment`: returns rejected promise if not pending
    - Error state: payment creation fails, error message shown
    - `goDetail()` navigation
    - `order?.value === null` path (order not found)
  - Use existing mock pattern (`vi.mock` + `vi.hoisted`)

  **Must NOT do**:
  - Do NOT change useCheckoutPage.ts implementation (only add tests)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T15, T17-T19)
  - **Parallel Group**: Wave 2

  **References**:
  - `src/composables/trade/__tests__/useCheckoutPage.test.ts` — Existing tests
  - `src/composables/trade/useCheckoutPage.ts` — Target composable

  **Acceptance Criteria**:
  - [ ] `npm run test -- src/composables/trade/__tests__/useCheckoutPage.test.ts` passes (≥6 cases, was 2)

  **Commit**: YES (groups with T15, T17-T19)

---

- [x] 17. **Add edge cases to useLoginPage test**

  **What to do**:
  - Augment `src/composables/auth/__tests__/useLoginPage.test.ts`
  - Add tests for:
    - Invalid verification code (server rejects)
    - Server error on login (500 response)
    - Server error on send code
    - Loading states: `isLoading` true during login, false after
    - Code countdown timer: decrements every second, disables resend until 0
  - Use existing mock pattern

  **Must NOT do**:
  - Do NOT change useLoginPage.ts implementation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T16, T18-T19)
  - **Parallel Group**: Wave 2

  **References**:
  - `src/composables/auth/__tests__/useLoginPage.test.ts` — Existing tests

  **Acceptance Criteria**:
  - [ ] `npm run test -- src/composables/auth/__tests__/useLoginPage.test.ts` passes (≥6 cases, was 2)

  **Commit**: YES (groups with T15-T16, T18-T19)

---

- [x] 18. **Add update/delete flows to eventEditFlows test**

  **What to do**:
  - Augment `src/composables/admin/event-edit/__tests__/eventEditFlows.test.ts`
  - Add tests for:
    - Update existing event (currently only tests CREATE)
    - Delete event
    - Update ticket type
    - Delete ticket type
    - `useSessionsAndTicketsTab` composable (currently untested)
  - Verify `useEventBasicTab` in edit mode (`isEdit: true`)

  **Must NOT do**:
  - Do NOT change event edit composables implementation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T17, T19)
  - **Parallel Group**: Wave 2

  **References**:
  - `src/composables/admin/event-edit/__tests__/eventEditFlows.test.ts` — Existing tests

  **Acceptance Criteria**:
  - [ ] `npm run test -- src/composables/admin/event-edit/__tests__/eventEditFlows.test.ts` passes (≥10 cases, was 5)

  **Commit**: YES (groups with T15-T17, T19)

---

- [x] 19. **Fix componentSmoke DialogStub v-if → :open**

  **What to do**:
  - In `src/components/__tests__/componentSmoke.test.ts`, fix the DialogStub to use `:open` prop instead of `v-if`
  - The stub currently uses `<section v-if="open">` which violates the project's `dialog-no-vif-with-open` ESLint rule
  - Change to `<section v-show="open">` or properly handle `:open` + transition
  - Ensure all 5 components under test still render correctly through the fixed stub

  **Must NOT do**:
  - Do NOT change the actual Dialog components (only the test stub)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-testing-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T18)
  - **Parallel Group**: Wave 2

  **References**:
  - `src/components/__tests__/componentSmoke.test.ts` — Test with DialogStub
  - ESLint rule: `dialog-no-vif-with-open`

  **Acceptance Criteria**:
  - [ ] DialogStub uses `:open` prop or `v-show`, not `v-if`
  - [ ] `npm run test -- src/components/__tests__/componentSmoke.test.ts` passes

  **Commit**: YES (groups with T15-T18)
  - Message: `test(components): fix DialogStub to use :open instead of v-if`
  - Files: `src/components/__tests__/componentSmoke.test.ts`

---

- [x] 20. **Dynamic import @zxing/browser in ScanCheckinDialog**

  **What to do**:
  - In `ScanCheckinDialog.vue`, move `import { BrowserQRCodeReader } from '@zxing/browser'` from static import to dynamic import
  - Trigger dynamic import inside the `watch` for `props.open` (when dialog opens)
  - Add loading state: show spinner while `@zxing/browser` loads
  - Add error state: show error message with retry button if import fails
  - Handle timeout: if chunk doesn't load within 10s, show error
  - Use `<Suspense>` or manual `ref` for loading/error states

  **Must NOT do**:
  - Do NOT change QR scanning logic (only the import mechanism)
  - Do NOT change the dialog's public API

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Bundle-critical change with UX implications
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T21-T22)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T11-T19 (architecture locked in)

  **References**:
  - `src/components/features/admin-ticket/ScanCheckinDialog.vue:3` — Static zxing import
  - `src/components/features/admin-ticket/ScanCheckinDialog.vue:120-131` — Watch for dialog open

  **Acceptance Criteria**:
  - [ ] `@zxing/browser` not in main bundle (check `dist/assets/*.js`)
  - [ ] ScanCheckinDialog chunk < 250KB (was 408KB)
  - [ ] Loading spinner shown while library loads
  - [ ] Error UI shown on import failure with retry
  - [ ] Camera initializes correctly after load
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: Scan dialog loads zxing dynamically with loading state
    Tool: Playwright
    Preconditions: Admin logged in, on /admin/tickets
    Steps:
      1. Navigate to /admin/tickets
      2. Click "扫码验票" button
      3. Assert: loading spinner visible (while zxing loads)
      4. Wait for camera stream (max 5s)
      5. Assert: camera preview visible
      6. Screenshot: .sisyphus/evidence/task-20-scan-dialog.png
    Expected Result: Smooth loading → camera transition, no console errors
    Failure Indicators: No camera, infinite spinner, console import errors
    Evidence: .sisyphus/evidence/task-20-scan-dialog.png

  Scenario: Scan dialog handles import failure gracefully
    Tool: Playwright
    Preconditions: Admin logged in, simulate network failure for zxing chunk
    Steps:
      1. Block zxing chunk URL in network tab
      2. Click "扫码验票"
      3. Assert: error message shown with retry button
      4. Click retry button
      5. Assert: retry attempted
    Expected Result: Graceful error state, user can retry
    Evidence: .sisyphus/evidence/task-20-scan-error.png
  ```

  **Commit**: YES
  - Message: `perf(bundle): dynamic import @zxing/browser in ScanCheckinDialog`
  - Files: `src/components/features/admin-ticket/ScanCheckinDialog.vue`
  - Pre-commit: `npm run build` (verify chunk sizes)

---

- [x] 21. **Dynamic import @stomp/stompjs in useWorkOrderChat**

  **What to do**:
  - In `useWorkOrderChat.ts`, change `import { Client } from '@stomp/stompjs'` to dynamic import inside `connect()`
  - Store the import promise in a ref to deduplicate concurrent connect calls
  - Add connecting state (composable already has reactive state)
  - Handle import failure gracefully (chat shows error, user can retry)

  **Must NOT do**:
  - Do NOT change WebSocket message handling logic
  - Do NOT change the singleton pattern

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T20, T22)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T11-T19

  **References**:
  - `src/composables/common/useWorkOrderChat.ts:2-3` — Static stomp import
  - `src/composables/common/useWorkOrderChat.ts:60` — connect() function

  **Acceptance Criteria**:
  - [ ] `@stomp/stompjs` not in main bundle
  - [ ] Chat connects successfully after dynamic import
  - [ ] Deduplication: concurrent connect() calls share one import promise
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: Work order chat connects after dynamic stomp import
    Tool: Playwright
    Preconditions: Admin logged in, open work order detail
    Steps:
      1. Navigate to admin work order detail
      2. Open chat panel
      3. Assert: "connecting" state shown briefly
      4. Assert: chat messages load within 3s
      5. Screenshot: .sisyphus/evidence/task-21-chat-connect.png
    Expected Result: Chat connects, messages appear
    Evidence: .sisyphus/evidence/task-21-chat-connect.png
  ```

  **Commit**: YES (groups with T20)
  - Message: `perf(bundle): dynamic import @stomp/stompjs in work order chat`
  - Files: `src/composables/common/useWorkOrderChat.ts`

---

- [x] 22. **Build verification + chunk size audit**

  **What to do**:
  - Run `npm run build`
  - Audit `dist/assets/` chunk sizes:
    - ScanCheckinDialog chunk: target < 250KB (was 408KB)
    - Main bundle (`index-*.js`): should be similar or smaller
    - RichTextEditor chunk: unchanged (already lazy)
  - Verify no new chunks > 200KB introduced
  - Run `npm run test` to confirm all tests pass
  - Document chunk sizes in build output

  **Must NOT do**:
  - Do NOT optimize other chunks (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T20-T21)
  - **Parallel Group**: Wave 3

  **References**:
  - `vite.config.ts` — Build configuration

  **Acceptance Criteria**:
  - [ ] `npm run build` succeeds
  - [ ] `npm run test` passes (24+ test files)
  - [ ] ScanCheckinDialog chunk < 250KB
  - [ ] Main bundle size not significantly larger
  - [ ] `@stomp/stompjs` not in main bundle

  **QA Scenarios**:

  ```
  Scenario: Build output meets size targets
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Run `ls -lh dist/assets/ | grep -E "ScanCheckin|index-|RichTextEditor"`
      3. Assert: ScanCheckinDialog < 250KB
      4. Assert: Main bundle < 200KB
      5. Run `grep -l "stomp" dist/assets/index-*.js` → expect empty
      6. Run `grep -l "zxing" dist/assets/index-*.js` → expect empty
    Expected Result: Chunk sizes within targets, no heavy libs in main bundle
    Evidence: .sisyphus/evidence/task-22-build-audit.txt
  ```

  **Commit**: NO (verification step, no code changes)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `tsc --noEmit` + `npm run lint:check` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
      Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
      Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `refactor(columns): split monolithic listPageColumns into per-entity files` + `test(core): add tests for format, mappers, statusMappers, useDialog, useCountdown, createAuthStore, useFollowToggle`
- **Wave 2**: `refactor(composables): remove useProfilePage pass-through, migrate Banner/Service to useAdminCrud, useHomePage to useQueries, ticketSelection to reducer` + `test(edge-cases): augment checkout, login, eventEditFlows, componentSmoke`
- **Wave 3**: `perf(bundle): dynamic import zxing and stompjs` + `perf(ui): fix AIChatMessageList keys and useAIChat array clone`
- **Wave FINAL**: `chore: final verification and cleanup`

---

## Success Criteria

### Verification Commands

```bash
npm run type-check    # Expected: 0 errors
npm run lint:check    # Expected: 0 errors
npm run build         # Expected: succeeds
npm run test          # Expected: 24+ test files pass
npm run ci            # Expected: all pass except pre-existing openapi + 1 test failure
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass (except pre-existing)
- [ ] Build chunk sizes verified: ScanCheckinDialog < 250KB, main bundle unchanged
- [ ] No new lint/type errors
- [ ] Pre-existing failures still fail (not accidentally "fixed")
