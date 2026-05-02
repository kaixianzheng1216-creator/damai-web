# Wave 1 执行计划：消除生产隐患 + 提升可维护性

## 目标

完成 Wave 1 的三个高优先级任务：

1. T1：统一错误处理策略（消除重复 toast）
2. T2：集中管理硬编码文案（新建 copy.ts）
3. T3：拆分巨型 Composable（7 个文件）

---

## Wave 1 执行策略

按依赖顺序执行，每个任务完成后验证通过再进行下一个。

```
T1 (错误处理) → T2 (文案迁移) → T3 (拆分 composable)
```

T1 和 T2 可并行（无依赖），T3 建议最后执行（涉及文件最多）。

---

## TODOs

- [x] T1：统一错误处理策略
  - [x] 修改 `src/api/request.ts`：GET 默认 `showError: true`，POST/PUT/PATCH/DELETE 默认 `showError: false`
  - [x] 验证 `type-check`、`lint:oxlint`、`lint:check`、`test` 通过
- [x] T2：集中管理硬编码文案
  - [x] 新建 `src/constants/copy.ts`
  - [x] 迁移 47 处 toast 文案到常量
  - [x] 验证 `type-check`、`lint:oxlint`、`lint:check`、`test` 通过
- [x] T3：拆分巨型 Composable
  - [x] `useServiceListPage.ts`（289 行）→ `useServiceList.ts` + `useServiceOptions.ts` + `useServiceDialog.ts`
  - [x] `useEventSearchPage.ts`（256 行）→ `useSearchFilters.ts` + `useSearchHistory.ts` + `useSearchResults.ts`
  - [x] `useCategoryListPage.ts`（253 行）→ `useCategoryTree.ts` + `useCategoryDialog.ts` + `useCategoryDragSort.ts`
  - [x] `useBannerListPage.ts`（208 行）→ `useBannerList.ts` + `useBannerDialog.ts`
  - [x] `useAdminCrud.ts`（207 行）→ 优化泛型复杂度
  - [x] `useEventBasicTab.ts`（196 行）→ 拆分为表单逻辑 + 提交逻辑
  - [x] `usePassengerManagement.ts`（181 行）→ 拆分为列表/表单/删除

---

## Final Verification Wave

- [x] `npm run type-check` 通过
- [x] `npm run lint:oxlint` 通过
- [x] `npm run lint:check` 通过
- [x] `npm run test` 通过（现有测试不破坏）

---

## Commit Strategy

- **T1**：`refactor(error): unify error handling strategy`
- **T2**：`refactor(copy): centralize hardcoded text into constants`
- **T3**：`refactor(composables): split oversized composables`

---

## Success Criteria

- [x] `npm run type-check` 通过
- [x] `npm run lint:oxlint` 通过
- [x] `npm run lint:check` 通过
- [x] `npm run test` 通过（现有测试不破坏）
