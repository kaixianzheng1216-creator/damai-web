# 修复 AI Chat flowName 切换 BUG

## TL;DR

> **问题**：从首页 AI 助手（`/ai`）跳转到客服助手（`/ai?mode=support`）时，Vue Router 复用组件实例，`useAIChat()` 只在 `<script setup>` 执行一次，`flowName` 被永久锁定为 `'assistant'`，导致客服请求错误地走到首页助手后端逻辑。
>
> **修复**：将 `useAIChat` 的 `options` 改为接受响应式输入（`MaybeRefOrGetter`），内部使用 `toRef()` 包裹并在 `watchEffect` 中监听 `flowName` 变化，变化时自动重置会话（重新生成 `sessionId`、清空消息、使用新的 `welcomeMessage`）。
>
> **涉及文件**：`src/composables/ai/useAIChat.ts`（主要改动）、`src/views/ai/AIChatView.vue`（验证无需改动）、新增 `src/composables/ai/__tests__/useAIChat.test.ts`
>
> **Estimated Effort**: Short
> **Parallel Execution**: NO - 2 sequential waves
> **Critical Path**: Task 1 (composable fix) → Task 2 (unit test) → Task 3 (QA verification)

---

## Context

### Original Request

用户发现：从首页的 Agent（智能助手）跳到客服 Agent（`/ai?mode=support`），然后向客服 Agent 提问时，请求的类型没有使用 `support`，而是走了 `assistant`。

### Interview Summary

**Key Discussions**:

- 根因已确认：Vue Router 在 `/ai` 路由下只改变 query 时复用组件实例，`useAIChat(chatOptions.value)` 只在初始化时调用一次
- `useAIChat` 内部第 19-24 行将 `options` 解构一次，`flowName` 成为闭包内的常量字符串
- 后端 OpenAPI 明确要求 `flowName` 区分 `assistant` 和 `support`，两者对应完全不同的提示词和工具集

**Research Findings**:

- `docs/Support Prompt.md`: 客服角色"小达"，工具集为 `getUserOrders` / `getUserTickets` / `createWorkOrder`，有 `status` 状态机
- `docs/Assistant Prompt.md`: 助手角色"小麦"，工具集为 `searchEvents` / `getUserFollowed`，无 `status`
- `src/api/ai/index.ts`: 请求 endpoint `/api/ai/front/ai/chat`，`flowName` 为必填字段
- 项目使用 Vitest + happy-dom，但 `useAIChat` 目前无单元测试

### Metis Review

**Identified Gaps** (addressed):

- `enableCityContext` 是否也需要响应式？→ **Guardrail**: 只响应式化 `flowName` 和 `welcomeMessage`，`enableCityContext` 保持初始化时行为（不影响核心修复）
- 模式切换时是否保留历史消息？→ **Guardrail**: 必须清空消息列表并显示新 welcomeMessage，因为 assistant 和 support 是完全不同的会话上下文
- `useAIChat` 是否在其他地方被调用？→ 搜索结果：仅 `AIChatView.vue` 一处直接调用

---

## Work Objectives

### Core Objective

修复 `useAIChat` composable，使其正确响应 `flowName` 变化，当用户在 assistant 和 support 模式之间切换时，向后端发送正确的 `flowName`。

### Concrete Deliverables

- `src/composables/ai/useAIChat.ts`：支持响应式 `options`，监听 `flowName` 自动重置会话
- `src/composables/ai/__tests__/useAIChat.test.ts`：单元测试验证 reactive options 行为
- 验证 `AIChatView.vue` 无需改动（其 `chatOptions` computed 已经能传递新值）

### Definition of Done

- [ ] `useAIChat` 接受 `MaybeRefOrGetter<UseAIChatOptions>` 或内部用 `toRef` 包裹 `flowName`
- [ ] 当 `flowName` 从 `'assistant'` 变为 `'support'` 时，sessionId 重新生成，messages 清空并显示新的 welcomeMessage
- [ ] 单元测试覆盖该场景并通过 `npm test`
- [ ] QA 场景验证：切换模式后 API 请求 payload 包含正确 `flowName`

### Must Have

- `flowName` 响应式监听与自动会话重置
- 新的 `welcomeMessage` 在模式切换后正确显示
- 单元测试覆盖 reactive options 路径

### Must NOT Have (Guardrails)

- **不要**改动路由配置（如强制组件销毁），本应在 composable 层面解决
- **不要**在 `AIChatView.vue` 添加复杂的 `onBeforeRouteUpdate` 逻辑
- **不要**引入第三方库，使用 Vue 3 内置的 `toValue`/`toRef`/`watch` 即可
- **不要**改动 `chatWithAI` API 层（`src/api/ai/*`）
- **不要**保留旧消息上下文到新模式中（assistant 和 support 是完全独立的会话）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision

- **Infrastructure exists**: YES (Vitest + happy-dom + @vue/test-utils)
- **Automated tests**: YES (Tests after implementation)
- **Framework**: vitest
- **Agent-Executed QA**: ALWAYS

### QA Policy

Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Sequential - core fix + test):
├── Task 1: Refactor useAIChat to support reactive options [quick]
└── Task 2: Add unit test for useAIChat reactive behavior [quick]

Wave 2 (After Wave 1 - QA + integration verification):
├── Task 3: Run type-check, lint, test, and manual QA [quick]

Wave FINAL (After ALL tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
└── Task F3: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

- **Task 1**: None → blocks Task 2, Task 3
- **Task 2**: depends Task 1 → blocks Task 3
- **Task 3**: depends Task 1, Task 2

---

## TODOs

- [ ] 1. **Refactor useAIChat to support reactive flowName**

  **What to do**:
  - 修改 `src/composables/ai/useAIChat.ts`：
    - 将 `UseAIChatOptions` 的字段改为接受响应式输入，或内部用 `toRef()` 包裹
    - 使用 `watch()` 监听 `flowName` ref 的变化
    - 当 `flowName` 变化时，自动调用内部重置逻辑：重新生成 `sessionId`、清空 `messages`、推入新的 `welcomeMessage`
    - `enableCityContext` 保持初始化时取值，不做响应式监听（减少复杂度，不影响核心修复）
  - 确保 `AIChatView.vue` 无需改动：它已使用 `computed` 产生 `chatOptions`，`useAIChat` 响应式化后自然能接收到新值

  **Must NOT do**:
  - 不要修改 `AIChatView.vue` 的路由守卫或生命周期
  - 不要引入新依赖
  - 不要在 `useAIChat` 外暴露新的 public API

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`
    - `vue-best-practices`: 确保响应式模式符合 Vue 3 Composition API 规范
  - **Skills Evaluated but Omitted**:
    - `create-adaptable-composable`: 本任务只修改现有 composable，不需要从零创建

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Sequential)
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None

  **References**:
  - `src/composables/ai/useAIChat.ts:19-24` - 当前 options 解构逻辑，需改为响应式
  - `src/composables/ai/useAIChat.ts:74-82` - 当前 `resetSession` 逻辑，需提取为内部函数供 watch 调用
  - `src/views/ai/AIChatView.vue:21-30` - `chatOptions` computed，确认已传递响应式值
  - Vue 3 文档: `toValue()` / `toRef()` / `watch()` 用法
  - `docs/AI 服务_OpenAPI.json` - `flowName` 字段说明：`assistant` 和 `support`

  **WHY Each Reference Matters**:
  - `useAIChat.ts:19-24`: 当前 `const { flowName = 'assistant', ... } = options` 是破坏响应式的根源
  - `useAIChat.ts:74-82`: `resetSession` 已包含生成新 sessionId 和重置 messages 的逻辑，watch 中可复用
  - `AIChatView.vue:21-30`: 验证调用方已经能传递变化的 options，不需要改动调用方

  **Acceptance Criteria**:
  - [ ] `useAIChat` 能正确接收并追踪 `flowName` 的变化
  - [ ] 当 `flowName` 变化时，`sessionId` 重新生成
  - [ ] 当 `flowName` 变化时，`messages` 清空并推入新的 `welcomeMessage`
  - [ ] `npm run type-check` 通过
  - [ ] `npm run lint:check` 通过

  **QA Scenarios**:

  ```
  Scenario: 从 assistant 模式切换到 support 模式
    Tool: Bash (node REPL / vitest)
    Preconditions: useAIChat 已初始化，flowName = 'assistant'
    Steps:
      1. 创建 ref options = { flowName: 'assistant', welcomeMessage: '助手欢迎语' }
      2. 调用 useAIChat(options)
      3. 断言 messages 包含 '助手欢迎语'
      4. 将 options.flowName 改为 'support'
      5. 将 options.welcomeMessage 改为 '客服欢迎语'
      6. 等待 watch 触发
      7. 断言 messages 只包含 '客服欢迎语'（旧消息已清空）
      8. 断言 sessionId 与之前不同
    Expected Result: flowName 变化后，会话完全重置为新模式的初始状态
    Failure Indicators: messages 仍保留旧消息；sessionId 未变；welcomeMessage 未更新
    Evidence: .sisyphus/evidence/task-1-mode-switch-pass.png

  Scenario: support 模式下发送消息
    Tool: Bash (vitest)
    Preconditions: useAIChat 已处于 support 模式
    Steps:
      1. 初始化 useAIChat({ flowName: 'support' })
      2. 调用 submit('查询订单')
      3. 验证 sendMessage mutationFn 被调用时，payload.flowName === 'support'
    Expected Result: API 请求携带正确的 flowName
    Failure Indicators: payload.flowName 为 'assistant'
    Evidence: .sisyphus/evidence/task-1-api-flowName-pass.png
  ```

  **Evidence to Capture**:
  - [ ] task-1-mode-switch-pass.png: 测试通过截图
  - [ ] task-1-api-flowName-pass.png: API payload 验证截图

  **Commit**: NO (groups with Task 2 in single commit)

---

- [ ] 2. **Add unit test for useAIChat reactive behavior**

  **What to do**:
  - 创建 `src/composables/ai/__tests__/useAIChat.test.ts`
  - 使用 Vitest + @vue/test-utils 测试 `useAIChat` 的响应式 options
  - 测试覆盖：
    1. 初始化时 `flowName` 默认值
    2. `flowName` 变化触发 session 重置
    3. `welcomeMessage` 随 `flowName` 变化而更新
    4. `submit` 在模式切换后仍正常工作
  - mock `chatWithAI` API 调用，避免真实网络请求

  **Must NOT do**:
  - 不要测试 UI 渲染（那是组件测试的范畴）
  - 不要引入新的测试工具或配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-testing-best-practices`
    - `vue-testing-best-practices`: 确保 Vitest + Vue Test Utils 测试模式正确
  - **Skills Evaluated but Omitted**:
    - `vue-best-practices`: 测试文件不需要

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1)
  - **Parallel Group**: Wave 1 (Sequential)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `src/api/ai/index.ts` - `chatWithAI` 函数签名，用于 mock
  - `src/composables/ai/useAIChat.ts` - 被测对象
  - 现有测试：`src/api/__tests__/requestTransforms.test.ts` - 参考项目测试写法

  **WHY Each Reference Matters**:
  - `requestTransforms.test.ts`: 参考项目现有的 Vitest 测试风格和 mock 模式

  **Acceptance Criteria**:
  - [ ] 测试文件创建：`src/composables/ai/__tests__/useAIChat.test.ts`
  - [ ] `npm run test src/composables/ai/__tests__/useAIChat.test.ts` → PASS
  - [ ] 测试覆盖率包含：初始化、flowName 变化、session 重置、submit 调用

  **QA Scenarios**:

  ```
  Scenario: 运行新增单元测试
    Tool: Bash (npm run test)
    Preconditions: Task 1 已完成
    Steps:
      1. npm run test src/composables/ai/__tests__/useAIChat.test.ts
    Expected Result: 所有测试通过，0 失败
    Failure Indicators: 任何测试失败或类型错误
    Evidence: .sisyphus/evidence/task-2-unit-test-pass.png

  Scenario: 运行全部测试套件确认无回归
    Tool: Bash (npm run test)
    Preconditions: Task 1 + Task 2 完成
    Steps:
      1. npm run test
    Expected Result: 所有现有测试仍通过，无新增失败
    Failure Indicators: 现有测试失败数 > 0
    Evidence: .sisyphus/evidence/task-2-full-test-suite-pass.png
  ```

  **Evidence to Capture**:
  - [ ] task-2-unit-test-pass.png: 新增测试通过截图
  - [ ] task-2-full-test-suite-pass.png: 全量测试无回归截图

  **Commit**: YES (groups with Task 1)
  - Message: `fix(ai): make useAIChat reactive to flowName changes`
  - Files: `src/composables/ai/useAIChat.ts`, `src/composables/ai/__tests__/useAIChat.test.ts`
  - Pre-commit: `npm run type-check && npm run test`

---

- [ ] 3. **QA verification and regression check**

  **What to do**:
  - 运行完整的类型检查、Lint 检查、单元测试、构建
  - 验证 `AIChatView.vue` 在模式切换时的行为：
    - 从 `/ai` 进入 → 显示 assistant 欢迎语
    - 点击 Header 的"客服"链接（`/ai?mode=support`）→ 显示 support 欢迎语，旧消息清空
    - 从 `/ai?mode=support` 返回 `/ai` → 显示 assistant 欢迎语，旧消息清空
  - 使用浏览器 DevTools Network 面板验证 API 请求 payload 中的 `flowName`

  **Must NOT do**:
  - 不要修改任何业务代码（本任务只验证）
  - 不要跳过 lint 或 type-check

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `playwright`
    - `playwright`: 用于自动化浏览器验证模式切换行为
  - **Skills Evaluated but Omitted**:
    - `vue-testing-best-practices`: 已在 Task 2 中使用

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1, Task 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `src/views/ai/AIChatView.vue` - 验证调用方无需改动即可工作
  - `src/router/index.ts:56-59` - AI Chat 路由配置
  - `src/components/common/TheHeader.vue:58-65` - "客服"链接跳转 `/ai?mode=support`

  **WHY Each Reference Matters**:
  - `TheHeader.vue:58-65`: 确认用户跳转入口，用于 QA 验证路径

  **Acceptance Criteria**:
  - [ ] `npm run type-check` → PASS
  - [ ] `npm run lint:check` → PASS
  - [ ] `npm run test` → PASS (all tests)
  - [ ] `npm run build-only` → PASS
  - [ ] Playwright/browser 验证：模式切换后 welcomeMessage 正确、API payload flowName 正确

  **QA Scenarios**:

  ```
  Scenario: 端到端验证 mode 切换行为
    Tool: Playwright / Browser DevTools
    Preconditions: 开发服务器运行 (npm run dev)
    Steps:
      1. 打开首页 `/`
      2. 点击右下角"智能助手"悬浮按钮 → 进入 `/ai`
      3. 断言页面标题为"Damai 智能助手"，欢迎语为"你好！我是 Damai 智能助手..."
      4. 发送一条消息"北京演唱会"
      5. 点击 Header 中的"客服"链接 → URL 变为 `/ai?mode=support`
      6. 断言页面标题变为"Damai 客服助手"，欢迎语变为"你好！我是 Damai 客服助手..."
      7. 断言消息列表已清空（不显示之前发的"北京演唱会"）
      8. 发送一条消息"查询订单"
      9. 打开 DevTools Network，找到 `/api/ai/front/ai/chat` 请求
      10. 断言 request payload 中 flowName === 'support'
    Expected Result: 模式切换完全正确，API 请求携带正确 flowName
    Failure Indicators: 欢迎语未变、消息未清空、flowName 为 'assistant'
    Evidence: .sisyphus/evidence/task-3-e2e-mode-switch.png

  Scenario: 反向切换验证（support → assistant）
    Tool: Playwright / Browser
    Preconditions: 当前在 `/ai?mode=support`
    Steps:
      1. 点击浏览器返回按钮或 Header 的 Logo 回到首页
      2. 再次点击"智能助手" → 进入 `/ai`
      3. 断言标题和欢迎语恢复为 assistant 模式
      4. 发送消息，验证 API payload flowName === 'assistant'
    Expected Result: 反向切换同样正确
    Failure Indicators: flowName 仍为 'support'
    Evidence: .sisyphus/evidence/task-3-reverse-switch.png
  ```

  **Evidence to Capture**:
  - [ ] task-3-e2e-mode-switch.png: 正向切换验证截图
  - [ ] task-3-reverse-switch.png: 反向切换验证截图

  **Commit**: NO (no code changes in this task)

---

## Final Verification Wave

> 3 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `npm run type-check` + `npm run lint:check` + `npm run test`. Review changed files for type safety, no `as any`, no unused imports.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Scope Fidelity Check** — `deep`
      Read diffs for each task. Verify 1:1 with spec. Check "Must NOT do" compliance. Detect scope creep.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **1**: `fix(ai): make useAIChat reactive to flowName changes`
  - Files: `src/composables/ai/useAIChat.ts`, `src/composables/ai/__tests__/useAIChat.test.ts`
  - Pre-commit: `npm run type-check && npm run test`

## Success Criteria

### Verification Commands

```bash
# 类型检查通过
npm run type-check

# Lint 通过
npm run lint:check

# 单元测试通过（含新增 useAIChat 测试）
npm run test

# 构建成功
npm run build-only
```

### Final Checklist

- [ ] 切换 `/ai?mode=support` 后，API 请求 payload 中 `flowName` 为 `'support'`
- [ ] 切换回 `/ai` 后，API 请求 payload 中 `flowName` 为 `'assistant'`
- [ ] 模式切换后，消息列表清空并显示对应模式的欢迎语
- [ ] `sessionId` 在模式切换后重新生成
- [ ] 所有原有功能不受影响（非切换场景下行为不变）
