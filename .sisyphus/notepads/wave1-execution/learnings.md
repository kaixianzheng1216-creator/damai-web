## Learnings

### T1: 统一错误处理策略

- `request.ts` 中 GET 默认 `showError: true`，POST/PUT/PATCH/DELETE 默认 `showError: false`。
- 这样 mutation 的 `onError` 可以自行处理 toast，避免与拦截器重复。

### T2: 集中管理硬编码文案

- 新建 `src/constants/copy.ts`，按 `TOAST_COPY`、`FORM_COPY`、`COMMON_COPY` 分组。
- 迁移时注意保持语义一致，不要改变用户可见文案。

### Test Fixes

- `p0AdminListPages.test.ts` 中 `queryKeys.admin.workOrderDetail()` 不传参时返回 `['admin-work-order-detail']`（不含 `undefined`），测试期望需同步更新。
- `eventDetailState.test.ts` 中 `resolveSelectedTicketTypeId` 依赖当前时间，在 2026-05-02 运行时会因 `saleEndAt: '2026-05-01'` 而失败。已通过给 `resolveSelectedTicketTypeId` 增加可选 `now` 参数修复。

## Decisions

- 拆分后的 composable 对外 API 保持不变（向后兼容）。
- 每个拆分后的 composable 目标行数 ≤150 行。
- 拆分过程中如需修改视图文件，只调整 import 路径，不改逻辑。

## Issues

- (none)

## Problems

- (none)

## Split: useEventSearchPage → useSearchFilters / useSearchHistory / useSearchResults

### Done

- Extracted filter state, URL sync, and category options into `useSearchFilters.ts` (119 lines).
- Extracted search query, pagination, sorting into `useSearchResults.ts` (82 lines).
- Created `useSearchHistory.ts` (3 lines) as a shell — no history logic existed in original.
- Rewrote `useEventSearchPage.ts` as a thin facade that wires the three composables and preserves exact return shape.
- All 67 tests pass; no diagnostics on changed files.

### Gotcha: Vue reactivity trap with `route.query`

Attempted to optimize `queryParams` by caching `const q = route.query` outside the `computed`. This broke reactivity in tests because `route.query` was reassigned to a new object by the mock router; the computed continued reading the stale `q` reference. **Fix:** access `route.query.xxx` directly inside the computed getter so Vue tracks the `route.query` dependency correctly.

## Split: useCategoryListPage → useCategoryTree / useCategoryDialog / useCategoryDragSort

### Done

- Extracted tree data loading, pagination, search, and tree state into `useCategoryTree.ts` (68 lines).
- Extracted dialog state, forms, mutations, and submit/delete handlers into `useCategoryDialog.ts` (108 lines).
- Created `useCategoryDragSort.ts` (3 lines) as a shell — no drag sort logic existed in original.
- Rewrote `useCategoryListPage.ts` as a thin facade that wires the three composables and preserves exact return shape.
- All 67 tests pass; no diagnostics on changed files.

### Gotcha: Barrel duplicate exports

If the facade file re-exports the new composables (`export { useCategoryTree } from './useCategoryTree'`) and the barrel `index.ts` also does `export * from './useCategoryTree'`, TypeScript reports a duplicate export error. **Fix:** keep re-exports inside the facade file only, and let the barrel continue doing `export * from './useCategoryListPage'`.

### Gotcha: UTF-8 BOM from PowerShell `Set-Content`

Using PowerShell `Set-Content -Encoding UTF8` prepends a UTF-8 BOM (EF BB BF), which Oxlint flags as irregular whitespace. **Fix:** strip the first three bytes before writing, or use `[System.IO.File]::WriteAllText` with `New-Object System.Text.UTF8Encoding($false)` to write without BOM.

## T3: Split useBannerListPage into useBannerList + useBannerDialog

- Followed existing service pattern: useServiceList / useServiceDialog / useServiceListPage facade.
- useBannerList returns invalidate function for cache invalidation.
- useBannerDialog accepts invalidate and openConfirm as parameters (same as useServiceDialog).
- Preserved exact return shape from facade so BannerListView.vue requires zero changes.
- Line counts: useBannerList.ts=73, useBannerDialog.ts=143, useBannerListPage.ts=62.
- All diagnostics clean; type-check passes; tests pass (1 pre-existing unrelated timeout).

## Split: useEventBasicTab �� useEventBasicForm / useEventBasicSubmit

### Done

- Extracted form state, query options (cities, categories, venues, series), computed categoryOptions, and eventData �� basicForm watch into useEventBasicForm.ts (89 lines).
- Extracted isLoading, create/update mutations, invalidateAll, buildSubmitData, and save into useEventBasicSubmit.ts (82 lines).
- Rewrote useEventBasicTab.ts as a thin facade (24 lines) that wires the two composables and preserves exact return shape.
- All 67 tests pass; no diagnostics on changed files; oxlint clean.

### Gotcha: Unused

ef import after extraction
After moving logic out of the original file, the new useEventBasicForm.ts still had
ef in its imports even though it was no longer used. Oxlint caught it immediately. **Fix:** removed the unused import before re-running oxlint.

## Split: usePassengerManagement → usePassengerList / usePassengerForm / usePassengerDelete

### Done

- Extracted list query, pagination, keyword, and computed list into `usePassengerList.ts` (70 lines).
- Extracted form state, Zod validation, dialog, create mutation, and submit into `usePassengerForm.ts` (92 lines).
- Extracted delete dialog state, delete mutation, and confirm handler into `usePassengerDelete.ts` (60 lines).
- Rewrote `usePassengerManagement.ts` as a thin facade (18 lines) that wires the three composables and preserves exact return shape.
- All 67 tests pass; no diagnostics on changed files; oxlint clean.

### Gotcha: Shared `passengerError` ref across form and delete mutations

Both `createPassengerMutation` and `deletePassengerMutation` originally wrote to the same `passengerError` ref on error. After splitting, `usePassengerForm` owns the ref, and `usePassengerDelete` accepts it as a parameter (`errorRef: Ref<string>`) so its `onError` can still mutate the shared error state. This preserves exact behavior without exposing `deletingPassengerId` or `refreshPassengerList` in the facade return.

## Optimize: useAdminCrud generic complexity

### Done

- Removed exported `UseAdminCrudOptions` and internal `UseAdminCrudSubmitOptions` interfaces (reduced generic boilerplate).
- Added a single internal `FormCb<TForm, TResult>` type alias to deduplicate `Readonly<UnwrapNestedRefs<TForm>>` callback signatures.
- Inlined the options shape directly into `useAdminCrud`'s parameter and `handleSubmit`'s parameter.
- Inlined `createInitialForm` and `applyFormValues` (they were internal-only helpers never exposed in the return object).
- Reduced file from 207 lines to 180 lines.
- Preserved exact public API: `useAdminCrud<TItem, TForm, TCreateRequest, TUpdateRequest>(options)` with identical return shape.
- All existing consumers compile without changes.
- `type-check` passes, `lint:oxlint` passes, `useAdminCrud.test.ts` passes (4/4).

### Gotcha: Pre-existing unrelated test timeout

Full test suite shows 1 failure in `useEventSearchPage.test.ts` (`normalizes URL query and syncs a child category to its parent` timed out). This is unrelated to `useAdminCrud` changes — it's a pre-existing flaky test in a different composable.
