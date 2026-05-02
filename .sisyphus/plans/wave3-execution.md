# Wave 3 执行计划：技术债务清理 + 文档完善

## 目标

完成 Wave 3 的七个低优先级任务：

1. T8：优化 Pinia Store（`computed` 优化 `isLoggedIn`）
2. T9：统一 defineProps 风格（约 50 个组件）
3. T10：清理 console.log 和 TODO/FIXME
4. T11：清理 `any` 类型
5. T12：拆分巨型组件（6 个文件）
6. T13：建立自动导入文档
7. T14：建立 API 层文档

---

## Wave 3 执行策略

全部任务互相独立，可并行执行：

```
T8 (Pinia Store) ──────┐
T9 (defineProps) ──────┤
T10+T11 (清理) ────────┼──→ Final Verification
T12 (拆分组件) ────────┤    (type-check, lint, test)
T13+T14 (文档) ────────┘
```

---

## TODOs

- [x] T8：优化 Pinia Store
  - [x] `src/stores/user.ts`：`isLoggedIn` 使用 `computed`
  - [x] `src/stores/admin.ts`：`isLoggedIn` 使用 `computed`
  - [x] 新建 `src/composables/common/useAuthStore.ts` 公共模式
  - [x] 验证 `type-check`、`test` 通过
- [x] T9：统一 defineProps 风格
  - [x] 简单组件（props ≤3）：inline `defineProps<{...}>()`
  - [x] 复杂组件（props >3 或有默认值）：`withDefaults(defineProps<{...}>(), {...})`
  - [x] 移除单独的 `interface Props` 定义（19 个文件）
  - [x] 验证 `lint:check` 通过
- [x] T10：清理 console.log 和 TODO/FIXME
  - [x] 处理 `ChartTooltipContent.vue` 中的 TODO
  - [x] ESLint 规则禁止 `console.log`
  - [x] 验证 `lint:check` 通过
- [x] T11：清理 any 类型
  - [x] `ChartTooltipContent.vue`：`Record<string, any>` → `Record<string, unknown>`
  - [x] 扫描业务代码中的 `any`（0 处剩余）
  - [x] 验证 `type-check` 通过
- [x] T12：拆分巨型组件
  - [x] `SessionList.vue`（308 行）→ 提取 `SessionDialog.vue`
  - [x] `DataTableCrud.vue`（303 行）→ 拆分 `TablePagination.vue` + `TableToolbar.vue`
  - [x] `CommonDataTableCrud.vue`（303 行）→ 拆分 `TableCardView.vue`
  - [x] `EventDetailHero.vue`（246 行）→ 提取 `EventFollowButton.vue` + `EventTicketPurchasePanel.vue` + `useEventFollow.ts`
  - [x] `WorkOrderDetailDialog.vue`（admin, 218 行）→ 已精简
  - [x] `ScanCheckinDialog.vue`（217 行）→ 已提取子组件
  - [x] 验证 `type-check`、`test` 通过
- [x] T13：建立自动导入文档
  - [x] 新建 `docs/auto-imports.md`
  - [x] 列出所有自动导入的 API
- [x] T14：建立 API 层文档
  - [x] 新建 `docs/api-directory.md`
  - [x] 按领域列出所有 API 文件和核心函数

---

## Final Verification Wave

- [x] `npm run type-check` 通过
- [x] `npm run lint:oxlint` 通过
- [x] `npm run lint:check` 通过
- [x] `npm run test` 通过（25 文件，93 测试）

---

## Commit Strategy

- **T8**：`refactor(stores): optimize Pinia store with computed`
- **T9**：`style(components): unify defineProps style across components`
- **T10+T11**：`refactor(cleanup): remove TODOs, console.log, and any types`
- **T12**：`refactor(components): split oversized components`
- **T13+T14**：`docs: add auto-imports and api-directory documentation`

---

## Success Criteria

- [x] `npm run type-check` 通过
- [x] `npm run lint:oxlint` 通过
- [x] `npm run lint:check` 通过
- [x] `npm run test` 通过（现有测试不破坏）
