# 可维护性提升 — CRITICAL 问题修复

## TL;DR

> **目标**: 修复 6 个 CRITICAL 可维护性问题，消除代码重复、补齐错误边界、统一错误状态处理。
>
> **Deliverables**:
>
> - `App.vue` 全局错误边界
> - `useAdminCrud` 暴露 `isError`/`error`，`DataTableCrud` 渲染错误状态
> - `ProfileView` 错误状态补齐
> - 4 个 admin 列表页迁移至 `useAdminCrud`
> - WebSocket 聊天集成模式提取为 `useWorkOrderChatIntegration`
> - `useServiceListPage` 拆分为服务 + 选项两个 composable
>
> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES — 3 Waves
> **Critical Path**: T2 (useAdminCrud isError) → T3-T7 (迁移/补齐) → F1-F4 (验证)

---

## Context

### Original Request

用户希望提升纯 Vibing Coding 实现项目的可维护性，优先修复 CRITICAL 级别问题。

### Interview Summary

**关键决策**:

- 优先修复 CRITICAL 问题，中高问题留到后续迭代
- 渐进式分批执行，降低回归风险

### Metis Review

**已修正的发现**:

- Issue #5（WebSocket）实际重复的是集成编排模式（~96 行/文件），而非底层传输（`useWorkOrderChat.ts` 已是共享的）
- Issue #4 中 `useServiceListPage` 已使用 `useAdminCrud`，真正的 4 个未使用 composable 是：`useAdminEventListPage`、`useAdminUserListPage`、`useOrderListPage`、`useTicketListPage`
- 执行顺序必须：错误边界(#2) → Admin错误状态(#1) → Profile错误状态(#3) → 迁移(#4) → WS集成(#5) → 服务拆分(#6)

**Guardrails Applied**:

- `useAdminCrud` 修改必须向后兼容，不破坏现有 9 个使用方
- 迁移保留每个 composable 的独特逻辑（事件发布/下线、用户状态切换、订单只读、扫码检票）
- 不修改超出范围的文件
- 所有现有测试必须继续通过

---

## Work Objectives

### Core Objective

修复 6 个 CRITICAL 可维护性问题，建立统一的错误处理架构，消除主要代码重复。

### Concrete Deliverables

- `src/App.vue` — 全局 `onErrorCaptured` 错误边界
- `src/composables/admin/common/useAdminCrud.ts` — 暴露 `isError`、`error`
- `src/components/admin/DataTableCrud.vue` — 错误状态渲染
- `src/views/profile/ProfileView.vue` 及相关 — 错误状态补齐
- `src/composables/admin/list-pages/useAdminEventListPage.ts` — 迁移至 `useAdminCrud`
- `src/composables/admin/list-pages/useAdminUserListPage.ts` — 迁移至 `useAdminCrud`
- `src/composables/admin/list-pages/useOrderListPage.ts` — 迁移至 `useAdminCrud`
- `src/composables/admin/list-pages/useTicketListPage.ts` — 迁移至 `useAdminCrud`
- `src/composables/common/useWorkOrderChatIntegration.ts` — 新建（提取集成模式）
- `src/composables/admin/list-pages/useServiceListPage.ts` — 拆分为服务 + 选项两个 composable

### Definition of Done

- [ ] `npm run ci` 通过（type-check + lint + test + build）
- [ ] 所有现有测试继续通过
- [ ] 每个任务包含的 QA Scenario 通过

### Must Have

- 错误边界在 App.vue 中生效
- useAdminCrud 暴露 isError/error 且不破坏现有使用方
- 4 个迁移后的 composable 功能等价

### Must NOT Have (Guardrails)

- 不修改未列入范围的其他 admin 列表页
- 不重构 API 层或路由
- 不添加新功能（仅重构）
- 不改写 OpenAPI 文档

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest + @vue/test-utils + happy-dom)
- **Automated tests**: Tests-after（每个重构任务完成后补充测试）
- **Framework**: vitest

### QA Policy

每个任务包含 Agent-Executed QA Scenarios。证据保存到 `.sisyphus/evidence/`。

- **API/Backend**: Bash (curl) — 验证请求/响应
- **Frontend/UI**: Playwright — 验证错误状态渲染
- **Library/Module**: Bash (bun test) — 运行单元测试

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — safety net, 2 tasks, BOTH independent):
├── T1: App.vue 全局错误边界 [quick]
└── T2: useAdminCrud 暴露 isError/error + DataTableCrud 错误状态 [unspecified-high]

Wave 2 (Max Parallel — 7 tasks, ALL depend on T2):
├── T3: ProfileView 错误状态补齐 [unspecified-high]
├── T4: useAdminEventListPage 迁移至 useAdminCrud [unspecified-high]
├── T5: useAdminUserListPage 迁移至 useAdminCrud [unspecified-high]
├── T6: useOrderListPage 迁移至 useAdminCrud [unspecified-high]
├── T7: useTicketListPage 迁移至 useAdminCrud [unspecified-high]
├── T8: 提取 useWorkOrderChatIntegration [deep]
└── T9: 拆分 useServiceListPage [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high)
├── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T2 → T4-T7 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 7 (Wave 2)
```

### Dependency Matrix

- **T1**: - — blocks: none (safety net)
- **T2**: - — blocks: T3-T7
- **T3**: T2 — blocks: none
- **T4-T7**: T2 — blocks: none
- **T8**: T2 (recommended) — blocks: none
- **T9**: T2 (recommended) — blocks: none
- **F1-F4**: ALL tasks — blocks: completion

### Agent Dispatch Summary

- **W1**: **2** — T1 → `quick`, T2 → `unspecified-high`
- **W2**: **7** — T3 → `unspecified-high`, T4-T7 → `unspecified-high` ×4, T8 → `deep`, T9 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. App.vue 全局错误边界

  **What to do**:
  - 在 `App.vue` 中添加 `onErrorCaptured` 生命周期钩子，捕获子孙组件的渲染错误
  - 当捕获到错误时，渲染 `ErrorState` 组件（或内联错误 UI）替代 `<RouterView />`
  - 监听路由变化，切换路由时重置错误状态
  - 保留现有的 `useTitle` 和 `<RouterView />` 结构

  **Must NOT do**:
  - 不要修改 main.ts 或 router
  - 不要用全局 `app.config.errorHandler` 替代 `onErrorCaptured`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: none
  - **Blocked By**: none

  **References**:
  - `src/App.vue:1-17` — 当前 App.vue 结构
  - `src/components/common/ErrorState.vue` — 错误状态组件参考

  **Acceptance Criteria**:
  - [ ] `onErrorCaptured` 注册在 App.vue `<script setup>` 中
  - [ ] 错误发生时显示 ErrorState 替代 RouterView
  - [ ] 路由切换时 `error.value = null`
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 正常渲染（无错误）
    Tool: Bash (npm run build-only)
    Preconditions: 无错误
    Steps:
      1. npm run build-only
    Expected Result: 构建成功，无类型错误
    Evidence: .sisyphus/evidence/task-1-build-pass.txt

  Scenario: 错误边界捕获渲染错误
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 临时在 HomeView.vue 中抛出一个错误: throw new Error('test')
      2. 访问首页
      3. 断言页面显示错误状态 UI，而非白屏
    Expected Result: 看到 ErrorState 组件内容
    Evidence: .sisyphus/evidence/task-1-error-boundary.png
  ```

  **Commit**: YES
  - Message: `fix(app): add global error boundary with onErrorCaptured`
  - Files: `src/App.vue`

- [ ] 2. useAdminCrud 暴露 isError/error + DataTableCrud 错误状态

  **What to do**:
  - 在 `useAdminCrud.ts` 中从 `useQuery` 解构 `isError` 和 `error`
  - 将两者加入返回对象
  - 在 `DataTableCrud.vue` 中接收 `error` 状态，当 `isError` 为 true 时渲染 `<ErrorState>`
  - 保持向后兼容：现有 9 个使用 `useAdminCrud` 的 composable 不感知此变化

  **Must NOT do**:
  - 不要修改现有 9 个使用方的代码
  - 不要改变 `useQuery` 的其他配置

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`, `vue-testing-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T3-T7
  - **Blocked By**: none

  **References**:
  - `src/composables/admin/common/useAdminCrud.ts:66-78` — useQuery 解构位置
  - `src/composables/admin/common/useAdminCrud.ts:169-196` — 返回对象位置
  - `src/components/admin/DataTableCrud.vue:82-153` — 表格渲染位置
  - `src/components/common/ErrorState.vue` — 错误状态组件
  - 现有测试: `src/composables/admin/common/__tests__/useAdminCrud.test.ts`

  **Acceptance Criteria**:
  - [ ] `useAdminCrud` 返回对象包含 `isError` 和 `error`
  - [ ] `DataTableCrud` 在 `isError` 时渲染 `ErrorState`
  - [ ] 现有测试 `useAdminCrud.test.ts` 仍通过
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 查询正常时表格正常渲染
    Tool: Bash (bun test src/composables/admin/common/__tests__/useAdminCrud.test.ts)
    Preconditions: 测试mock正常响应
    Steps:
      1. 运行 useAdminCrud 测试
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-2-admin-crud-test.txt

  Scenario: 查询失败时显示错误状态
    Tool: Playwright
    Preconditions: 开发服务器运行
    Steps:
      1. 临时修改 BannerListView 的 API 为错误路径
      2. 访问 admin/banners
      3. 断言页面显示 ErrorState 组件
    Expected Result: 看到错误状态 UI，而非空白或无限 loading
    Evidence: .sisyphus/evidence/task-2-datatable-error.png
  ```

  **Commit**: YES
  - Message: `feat(admin): expose isError/error from useAdminCrud, render ErrorState in DataTableCrud`
  - Files: `src/composables/admin/common/useAdminCrud.ts`, `src/components/admin/DataTableCrud.vue`

- [ ] 3. ProfileView 错误状态补齐

  **What to do**:
  - 为 ProfileView 的 7 个子 section 补齐错误状态
  - 对于使用 `DataTableCrud` 的 section（Orders、Tickets、WorkOrders、FollowedEvents、FollowedParticipants），利用 T2 中 DataTableCrud 新增的错误状态渲染能力
  - 对于不使用 DataTableCrud 的 section（Info、Passengers），在其对应 section 组件中手动添加 `isError` 检测和 `ErrorState` 渲染
  - 更新 `ProfilePageShell.vue`，确保 loading/error/success 三态完整

  **Must NOT do**:
  - 不要重构 profile composable 的 API 调用逻辑
  - 不要修改 ProfileSidebar 或导航逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2

  **References**:
  - `src/views/profile/ProfileView.vue` — 主视图
  - `src/components/features/profile/ProfileSectionContent.vue` — section 内容分发
  - `src/components/features/profile/ProfilePageShell.vue` — 页面外壳
  - `src/components/features/profile/ProfileOrdersSection.vue` — 使用 DataTableCrud
  - `src/components/features/profile/ProfileTicketsSection.vue` — 使用 DataTableCrud
  - `src/components/common/ErrorState.vue` — 错误状态组件

  **Acceptance Criteria**:
  - [ ] Profile 所有 7 个 section 在查询失败时显示 ErrorState
  - [ ] 切换 section 时错误状态正确重置
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: Profile 订单 section 查询失败
    Tool: Playwright
    Preconditions: 开发服务器运行，用户已登录
    Steps:
      1. 临时修改 fetchMyOrderPage 返回 500
      2. 访问 /profile，点击"订单管理"
      3. 断言页面显示 ErrorState
    Expected Result: 显示错误状态 UI，而非空白
    Evidence: .sisyphus/evidence/task-3-profile-error.png
  ```

  **Commit**: YES
  - Message: `fix(profile): add error states to all profile sections`
  - Files: `src/components/features/profile/ProfileSectionContent.vue`, `src/components/features/profile/ProfilePageShell.vue`, `src/components/features/profile/ProfileOrdersSection.vue`, `src/components/features/profile/ProfileTicketsSection.vue`

- [ ] 4. useAdminEventListPage 迁移至 useAdminCrud

  **What to do**:
  - 将 `useAdminEventListPage` 从手动实现的分页/查询/CRUD 逻辑迁移至使用 `useAdminCrud`
  - 保留独特逻辑：路由导航（create/edit）、发布/下线 mutation、多字段搜索（name + city + category）
  - 使用 `useAdminCrud` 的 `extraSearchParams` 选项传递 cityId 和 categoryId
  - 删除手动重复的分页 refs、queryKey computed、useQuery、list/totalRow/totalPages computed

  **Must NOT do**:
  - 不要删除发布/下线/路由导航等独特逻辑
  - 不要修改 EventEditView.vue 的调用方式（保持接口兼容）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`, `vue-testing-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2

  **References**:
  - `src/composables/admin/list-pages/useAdminEventListPage.ts` — 待迁移文件
  - `src/composables/admin/common/useAdminCrud.ts` — 目标模式
  - `src/composables/admin/list-pages/useBannerListPage.ts` — 使用 extraSearchParams 的参考
  - `src/views/admin/EventListView.vue` — 调用方
  - 现有测试: `src/composables/admin/list-pages/__tests__/p0AdminListPages.test.ts`

  **Acceptance Criteria**:
  - [ ] 迁移后功能完全等价（搜索、分页、CRUD、发布、下线、路由跳转）
  - [ ] 代码行数减少 ~40%
  - [ ] 现有测试仍通过
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 事件列表 CRUD 正常
    Tool: Playwright
    Preconditions: 开发服务器运行，管理员已登录
    Steps:
      1. 访问 /admin/events
      2. 搜索、分页、创建、编辑、删除操作均正常
    Expected Result: 所有操作与迁移前行为一致
    Evidence: .sisyphus/evidence/task-4-event-list-crud.png
  ```

  **Commit**: YES
  - Message: `refactor(admin): migrate useAdminEventListPage to useAdminCrud`
  - Files: `src/composables/admin/list-pages/useAdminEventListPage.ts`

- [ ] 5. useAdminUserListPage 迁移至 useAdminCrud

  **What to do**:
  - 将 `useAdminUserListPage` 迁移至 `useAdminCrud`
  - 保留独特逻辑：双字段搜索（name + mobile）、状态切换 mutation
  - 使用 `extraSearchParams` 传递 mobile

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2

  **References**:
  - `src/composables/admin/list-pages/useAdminUserListPage.ts`
  - `src/composables/admin/common/useAdminCrud.ts`

  **Acceptance Criteria**:
  - [ ] 迁移后功能等价
  - [ ] 代码行数减少 ~40%
  - [ ] `npm run ci` 通过

  **Commit**: YES
  - Message: `refactor(admin): migrate useAdminUserListPage to useAdminCrud`
  - Files: `src/composables/admin/list-pages/useAdminUserListPage.ts`

- [ ] 6. useOrderListPage 迁移至 useAdminCrud

  **What to do**:
  - 将 `useOrderListPage` 迁移至 `useAdminCrud`
  - 保留独特逻辑：状态筛选（只读，无增删改）、订单详情弹窗
  - `useAdminCrud` 配置中不提供 `createItem`/`updateItem`/`deleteItem`（或提供 no-op）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2

  **References**:
  - `src/composables/admin/list-pages/useOrderListPage.ts`
  - `src/composables/admin/common/useAdminCrud.ts`
  - 现有测试: `src/composables/admin/list-pages/__tests__/useOrderListPage.test.ts`

  **Acceptance Criteria**:
  - [ ] 迁移后功能等价（搜索、筛选、分页、详情弹窗）
  - [ ] 代码行数减少 ~40%
  - [ ] 现有测试仍通过
  - [ ] `npm run ci` 通过

  **Commit**: YES
  - Message: `refactor(admin): migrate useOrderListPage to useAdminCrud`
  - Files: `src/composables/admin/list-pages/useOrderListPage.ts`

- [ ] 7. useTicketListPage 迁移至 useAdminCrud

  **What to do**:
  - 将 `useTicketListPage` 迁移至 `useAdminCrud`
  - 保留独特逻辑：状态筛选（只读）、扫码检票按钮

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2

  **References**:
  - `src/composables/admin/list-pages/useTicketListPage.ts`
  - `src/composables/admin/common/useAdminCrud.ts`

  **Acceptance Criteria**:
  - [ ] 迁移后功能等价
  - [ ] 代码行数减少 ~40%
  - [ ] `npm run ci` 通过

  **Commit**: YES
  - Message: `refactor(admin): migrate useTicketListPage to useAdminCrud`
  - Files: `src/composables/admin/list-pages/useTicketListPage.ts`

- [ ] 8. 提取 useWorkOrderChatIntegration

  **What to do**:
  - 新建 `useWorkOrderChatIntegration(queryKeyBase, tokenRef, isAdmin?)` composable
  - 提取 `useWorkOrderList.ts` 和 `useAdminWorkOrderListPage.ts` 中重复的集成编排逻辑：
    - token-watch → chat.connect
    - onReconnect → invalidateQueries + re-subscribe
    - openDetail → subscribe + setQueryData callback
    - closeDetail → unsubscribe
    - submitReply → Zod 验证 + 状态检查 + chat.sendMessage
  - 两个原有 composable 改为消费 `useWorkOrderChatIntegration`
  - 每个文件减少 ~96 行

  **Must NOT do**:
  - 不要修改 `useWorkOrderChat.ts`（底层 WebSocket 已是共享的）
  - 不要改变 chat 消息格式或协议

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2 (recommended)

  **References**:
  - `src/composables/profile/useWorkOrderList.ts:23-88, 123-194` — 待提取的 profile 集成逻辑
  - `src/composables/admin/list-pages/useAdminWorkOrderListPage.ts:54-88, 136-195` — 待提取的 admin 集成逻辑
  - `src/composables/common/useWorkOrderChat.ts` — 底层 WebSocket（不修改）
  - 现有测试: `src/composables/profile/__tests__/useWorkOrderList.test.ts`

  **Acceptance Criteria**:
  - [ ] 新建 `useWorkOrderChatIntegration.ts`
  - [ ] 两个原有 composable 各减少 ~96 行
  - [ ] 功能完全等价（连接、重连、订阅、回复、关闭）
  - [ ] 现有测试仍通过
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 工单聊天正常连接和回复
    Tool: Bash (bun test src/composables/profile/__tests__/useWorkOrderList.test.ts)
    Preconditions: 测试 mock WebSocket
    Steps:
      1. 运行 useWorkOrderList 测试
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-8-ws-test.txt
  ```

  **Commit**: YES
  - Message: `refactor(work-order): extract useWorkOrderChatIntegration composable`
  - Files: `src/composables/common/useWorkOrderChatIntegration.ts`, `src/composables/profile/useWorkOrderList.ts`, `src/composables/admin/list-pages/useAdminWorkOrderListPage.ts`

- [ ] 9. 拆分 useServiceListPage

  **What to do**:
  - 新建 `useServiceOptions(serviceId: Ref<string | null>)` composable，管理服务选项的 CRUD
  - 将 `useServiceListPage.ts` 中选项相关逻辑（lines 146-273）迁移到新 composable
  - 原 `useServiceListPage` 保留服务 CRUD（通过 `useAdminCrud`）并组合 `useServiceOptions`
  - 返回对象从 36 个属性缩减为合理数量

  **Must NOT do**:
  - 不要修改 ServiceListView.vue 的接口（保持兼容或同步更新）
  - 不要改变选项 CRUD 的 API 调用

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: none
  - **Blocked By**: T2 (recommended)

  **References**:
  - `src/composables/admin/list-pages/useServiceListPage.ts` — 待拆分文件
  - `src/views/admin/ServiceListView.vue` — 调用方

  **Acceptance Criteria**:
  - [ ] 新建 `useServiceOptions.ts`
  - [ ] `useServiceListPage` 代码行数从 317 降至 <200
  - [ ] 服务和选项 CRUD 功能等价
  - [ ] `npm run ci` 通过

  **Commit**: YES
  - Message: `refactor(admin): split useServiceListPage into service + option composables`
  - Files: `src/composables/admin/list-pages/useServiceListPage.ts`, `src/composables/admin/common/useServiceOptions.ts`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each task: verify deliverable exists (read file, check exports). Verify `useAdminCrud` returns `isError`/`error`. Verify 4 migrated composables use `useAdminCrud`. Verify `App.vue` has `onErrorCaptured`. Check evidence files exist.
      Output: `Tasks [N/N] | Must Have [N/N] | Must NOT Have [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `npm run ci`. Review all changed files for: `as any`, empty catches, `console.log`, unused imports. Check AI slop: excessive comments, generic names.
      Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Lint [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
      Execute EVERY QA scenario from tasks T1-T9. Test error boundary with deliberate throw. Test admin list error states. Test profile error states. Test work order chat. Capture evidence.
      Output: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff. Verify 1:1 mapping. Check no files outside scope were modified. Verify guardrails respected.
      Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1**: `fix(app): add global error boundary with onErrorCaptured`
- **T2**: `feat(admin): expose isError/error from useAdminCrud, render ErrorState in DataTableCrud`
- **T3**: `fix(profile): add error states to all profile sections`
- **T4**: `refactor(admin): migrate useAdminEventListPage to useAdminCrud`
- **T5**: `refactor(admin): migrate useAdminUserListPage to useAdminCrud`
- **T6**: `refactor(admin): migrate useOrderListPage to useAdminCrud`
- **T7**: `refactor(admin): migrate useTicketListPage to useAdminCrud`
- **T8**: `refactor(work-order): extract useWorkOrderChatIntegration composable`
- **T9**: `refactor(admin): split useServiceListPage into service + option composables`

---

## Success Criteria

### Verification Commands

```bash
npm run ci          # Expected: all gates pass
npm run test        # Expected: 32+ tests pass (including any new tests)
```

### Final Checklist

- [ ] All CRITICAL issues from scan resolved
- [ ] `npm run ci` passes
- [ ] All existing tests continue to pass
- [ ] No regression in admin list pages (16 total)
- [ ] No regression in profile sections (7 total)
- [ ] Error boundary catches render errors
- [ ] Code duplication reduced by ~400+ lines
