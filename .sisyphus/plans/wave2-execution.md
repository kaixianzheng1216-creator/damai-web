# Wave 2 执行计划：提升可维护性 + 开发体验

## 目标

完成 Wave 2 的四个中优先级任务：

1. T4：拆分巨型 API 类型文件（`src/api/event/types.ts` 556 行）
2. T5：统一 API 函数命名（建立命名约定 + 重命名）
3. T6：补充核心流程测试（新增 ≥5 个测试文件）
4. T7：优化常量/枚举管理（状态映射 + `as const`）

---

## Wave 2 执行策略

按依赖和并行性执行：

```
T4 (API 类型拆分) ──┐
T7 (常量优化) ──────┼──→ Final Verification
T5 (API 命名统一) ──┤    (type-check, lint, test)
T6 (测试补充) ──────┘
```

T4 和 T7 可并行（无文件冲突）。
T5 依赖 T4 完成（避免在拆分过程中重命名）。
T6 可独立进行（仅新增测试文件）。

---

## TODOs

- [x] T4：拆分巨型 API 类型文件
  - [x] `src/api/event/types.ts` → 拆分为 `types/event.ts`, `types/session.ts`, `types/ticketType.ts`, `types/category.ts`, `types/series.ts`, `types/city.ts`, `types/venue.ts`
  - [x] 原 `types.ts` 改为 barrel export
  - [x] `src/api/trade/types.ts` → 拆分为 `types/order.ts`, `types/workOrder.ts`
  - [x] `src/api/account/types.ts` → 拆分为 `types/user.ts`, `types/passenger.ts`, `types/auth.ts`, `types/admin.ts`, `types/profile.ts`
  - [x] 验证 `type-check`、`lint:oxlint`、`lint:check`、`test` 通过
- [x] T5：统一 API 函数命名
  - [x] 新建 `docs/api-naming.md`
  - [x] 重命名 `replyWorkOrder` → `submitWorkOrderReply` 等
  - [x] 旧名称标记 `@deprecated`
  - [x] 验证 `type-check`、`lint:oxlint`、`lint:check`、`test` 通过
- [x] T6：补充核心流程测试
  - [x] 新增 `useRefundDialog.test.ts` (5 tests)
  - [x] 新增 `useWorkOrderList.test.ts` (5 tests)
  - [x] 新增 `usePassengerList.test.ts` (4 tests)
  - [x] 新增 `useBannerListPage.test.ts` (6 tests)
  - [x] 新增 `useCategoryListPage.test.ts` (8 tests)
  - [x] 验证 `test` 全部通过 (93/93)
- [x] T7：优化常量/枚举管理
  - [x] `src/constants/trade.ts`：添加 `ORDER_STATUS_LABEL` / `WORK_ORDER_STATUS_LABEL`
  - [x] `src/constants/profile.ts`：`PASSENGER_CERT_TYPES` 改为对象格式
  - [x] `src/utils/statusMappers.ts`：统一映射逻辑
  - [x] 验证 `type-check`、`lint:oxlint`、`lint:check`、`test` 通过

---

## Final Verification Wave

- [x] `npm run type-check` 通过
- [x] `npm run lint:oxlint` 通过
- [x] `npm run lint:check` 通过
- [x] `npm run test` 通过（93/93，新增 26 个测试）

---

## Commit Strategy

- **T4**：`refactor(api): split event types into domain files`
- **T5**：`refactor(api): unify API function naming conventions`
- **T6**：`test(composables): add core flow tests`
- **T7**：`refactor(constants): improve status enums and labels`

---

## Success Criteria

- [x] `npm run type-check` 通过
- [x] `npm run lint:oxlint` 通过
- [x] `npm run lint:check` 通过
- [x] `npm run test` 通过（93/93，新增 26 个测试）
