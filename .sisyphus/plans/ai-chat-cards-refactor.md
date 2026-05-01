# AI 对话卡片组件拆分

## TL;DR

> 将 `AIEventRecommendationCard.vue` 拆分为三个独立卡片组件（`AIChatEventCard`、`AIChatOrderCard`、`AIChatTicketCard`），支持后端文档定义的完整字段。扩展 `AiChatItem` 为 discriminated union，更新消息列表渲染分发逻辑。
>
> **Deliverables**:
>
> - `src/api/ai/types.ts` —— discriminated union 类型定义
> - `src/components/features/ai/AIChatEventCard.vue` —— 助手场景活动卡片
> - `src/components/features/ai/AIChatOrderCard.vue` —— 客服场景订单卡片
> - `src/components/features/ai/AIChatTicketCard.vue` —— 客服场景电子票卡片
> - `src/components/features/ai/AIChatMessageList.vue` —— 更新卡片渲染分发
> - `src/components/features/ai/index.ts` —— barrel export 更新
> - `src/constants/ai.ts` —— 补充新文案
> - `src/composables/ai/__tests__/useAIChat.test.ts` —— 更新测试 mock
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: T1 (types) → T2-T4 (cards in parallel) → T5 (message list) → T6 (tests) → F1-F4

---

## Context

### Original Request

用户要求参考 `docs/AI对话前端对接文档.md` 的字段定义，拆分 AI 对话的卡片组件。

### Interview Summary

**Key Discussions**:

- 字段命名：后端先修改 AI Agent 提示词，让 AI 直接返回 camelCase 字段。前端保持现有 camelCase 风格，不做 snake→camel 映射。
- 卡片交互：保持现有路由跳转——event→/detail/:id, order→/checkout/:id, ticket→/ticket/:id。
- 参考文档：docs/AI对话前端对接文档.md（字段定义）、docs/Assistant Prompt.md（助手场景）、docs/Support Prompt.md（客服场景）。

### Metis Review

**Identified Gaps** (addressed):

- 后端部署顺序：确认后端先改提示词，前端再改代码。
- 未知 type 值：计划中添加 fallback 处理。
- 字段可选性：Metis 建议加 `?` 标记。计划采用保守策略——所有非关键字段标记为可选，关键字段（id, type, name/eventNameSnapshot, totalAmount/minPrice/maxPrice, statusLabel, orderNo, ticketNo）必填。
- 状态标签颜色：计划采用简单 Badge 样式，不引入复杂颜色映射。
- 测试范围：更新现有 `useAIChat.test.ts` mock 数据，不新增组件测试（与项目现有测试策略一致）。

---

## Work Objectives

### Core Objective

将单一卡片组件拆分为三个类型安全的独立组件，完整支持后端文档定义的三种 items 结构。

### Concrete Deliverables

- `src/api/ai/types.ts` —— `AiChatItem` discriminated union + `AiChatEventItem` / `AiChatOrderItem` / `AiChatTicketItem`
- `src/components/features/ai/AIChatEventCard.vue` —— 活动卡片（封面、名称、艺人、城市、场馆、时间区间、价格区间、跳转）
- `src/components/features/ai/AIChatOrderCard.vue` —— 订单卡片（封面、活动名、场馆、时间、金额×数量、订单号、状态、跳转）
- `src/components/features/ai/AIChatTicketCard.vue` —— 电子票卡片（封面、活动名、场馆、时间、购票人、票号、状态、跳转）
- `src/components/features/ai/AIChatMessageList.vue` —— 根据 `item.type` 分发渲染对应卡片
- `src/components/features/ai/index.ts` —— 更新 barrel export
- `src/constants/ai.ts` —— 补充文案常量
- `src/composables/ai/__tests__/useAIChat.test.ts` —— 更新 mock 数据以匹配新类型

### Definition of Done

- [ ] `npm run type-check` 通过零错误
- [ ] `npm run test` 通过（含更新后的 useAIChat.test.ts）
- [ ] `npm run lint:check` 通过
- [ ] `npm run lint:oxlint` 通过
- [ ] `npm run build` 成功

### Must Have

- 三种卡片组件独立文件，UI 与后端文档示意一致
- `AiChatItem` 为 discriminated union，TypeScript 可正确 narrowing
- 消息列表对未知 type 有 fallback（不报错、不渲染卡片）
- 所有实体 ID 保持 `string` 类型
- 使用现有 `formatPrice()`（金额 ÷100）和 `formatDateTime()` 工具
- 使用 `icon-lucide-*` 命名自动导入图标

### Must NOT Have (Guardrails)

- 不修改后端代码、API 端点、提示词模板
- 不改变路由逻辑
- 不修改 `useAIChat.ts` composable 核心逻辑
- 不添加 snake→camel 映射层
- 不提取通用"AI card renderer"抽象
- 不修改 `AIChatMessageList.vue` 超过卡片渲染分发逻辑
- 不添加动画、loading skeleton、点击追踪
- 不添加新依赖

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision

- **Infrastructure exists**: YES (Vitest + @vue/test-utils + happy-dom)
- **Automated tests**: Tests-after (更新现有 useAIChat.test.ts，不新增组件测试)
- **Framework**: Vitest
- **Agent-Executed QA**: 每个任务包含具体 QA 场景

### QA Policy

- **Frontend/UI**: Playwright 打开 dev server，发送 mock AI 消息，断言卡片渲染内容
- **Library/Module**: Bash (bun/node REPL) 导入类型，验证 discriminated union narrowing
- **Evidence saved to**: `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — types + constants + utilities):
├── T1: 扩展 AiChatItem discriminated union 类型
├── T2: 补充 AI 相关常量和文案
└── T3: 新增/更新格式化工具函数（价格区间、时间区间）

Wave 2 (Cards — MAX PARALLEL, depends: T1, T2):
├── T4: AIChatEventCard 组件（活动卡片）
├── T5: AIChatOrderCard 组件（订单卡片）
├── T6: AIChatTicketCard 组件（电子票卡片）
└── T7: 更新 features/ai/index.ts barrel export

Wave 3 (Integration + Tests, depends: T4-T7):
├── T8: 更新 AIChatMessageList 卡片渲染分发
└── T9: 更新 useAIChat.test.ts mock 数据 + 运行测试

Wave FINAL (After ALL — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task               | Blocked By | Blocks |
| ------------------ | ---------- | ------ |
| T1 (types)         | —          | T4-T6  |
| T2 (constants)     | —          | T4-T6  |
| T3 (format utils)  | —          | T4-T6  |
| T4 (event card)    | T1, T2, T3 | T8     |
| T5 (order card)    | T1, T2, T3 | T8     |
| T6 (ticket card)   | T1, T2, T3 | T8     |
| T7 (barrel export) | T4, T5, T6 | T8     |
| T8 (message list)  | T4-T7      | T9     |
| T9 (tests)         | T8         | F1-F4  |
| F1-F4              | T9         | —      |

### Agent Dispatch Summary

- **Wave 1**: T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: T4 → `visual-engineering`, T5 → `visual-engineering`, T6 → `visual-engineering`, T7 → `quick`
- **Wave 3**: T8 → `visual-engineering`, T9 → `quick`
- **FINAL**: F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] T1. 扩展 `AiChatItem` discriminated union 类型定义

  **What to do**:
  - 修改 `src/api/ai/types.ts`，将 `AiChatItem` 从统一接口改为 discriminated union
  - 定义 `AiChatEventItem`、`AiChatOrderItem`、`AiChatTicketItem` 三个接口
  - 更新 `ChatMessage` 接口（保持不变，items 仍为 `AiChatItem[]`）
  - 确保 `AiChatRequest` / `AiChatResponse` 不变

  **Type Definitions**:

  ```ts
  export interface AiChatEventItem {
    type: 'event'
    id: string
    name: string
    coverUrl?: string
    participantName?: string
    cityNameSnapshot?: string
    venueNameSnapshot?: string
    firstSessionStartAt?: string
    lastSessionEndAt?: string
    minPrice: number
    maxPrice: number
  }

  export interface AiChatOrderItem {
    type: 'order'
    id: string
    eventNameSnapshot: string
    eventCoverUrlSnapshot?: string
    venueNameSnapshot?: string
    sessionStartAtSnapshot?: string
    totalAmount: number
    quantity: number
    status: number
    statusLabel: string
    orderNo: string
  }

  export interface AiChatTicketItem {
    type: 'ticket'
    id: string
    eventNameSnapshot: string
    eventCoverUrlSnapshot?: string
    venueNameSnapshot?: string
    sessionStartAtSnapshot?: string
    passengerNameSnapshot?: string
    status: number
    statusLabel: string
    ticketNo: string
  }

  export type AiChatItem = AiChatEventItem | AiChatOrderItem | AiChatTicketItem
  ```

  **Must NOT do**:
  - 不改 `AiChatRequest` / `AiChatResponse` 结构
  - 不改 `useAIChat.ts` 中的逻辑
  - 不修改任何组件文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`
  - Reason: 纯类型定义修改，无 UI 逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3)
  - **Blocks**: T4, T5, T6
  - **Blocked By**: None

  **References**:
  - `src/api/ai/types.ts` —— 当前类型定义
  - `docs/AI对话前端对接文档.md` —— 后端字段定义
  - `src/api/requestTransforms.ts` —— ID 归一化逻辑（确保新类型中的 id 仍为 string）

  **Acceptance Criteria**:
  - [ ] TypeScript discriminated union 正确定义，三种 type 值可 narrowing
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Type narrowing works correctly
    Tool: Bash (node REPL / tsc)
    Steps:
      1. Run `npx tsc --noEmit src/api/ai/types.ts`
      2. Create a test snippet that uses type guard: item.type === 'event' → item.name is accessible
      3. item.type === 'order' → item.orderNo is accessible
      4. item.type === 'ticket' → item.ticketNo is accessible
    Expected Result: No TypeScript errors, narrowing works as expected
    Evidence: .sisyphus/evidence/t1-type-narrowing.log
  ```

  **Commit**: YES
  - Message: `types(ai): extend AiChatItem to discriminated union for event/order/ticket`
  - Files: `src/api/ai/types.ts`

---

- [ ] T2. 补充 AI 相关常量和文案

  **What to do**:
  - 修改 `src/constants/ai.ts`
  - 补充客服场景卡片 action 按钮文案："查看订单"、"查看电子票" 已存在，确认是否需要新增
  - 补充状态标签相关常量（如果需要颜色映射）
  - 考虑添加价格区间格式化相关常量

  **Must NOT do**:
  - 不改现有快捷提示和文案
  - 不引入复杂的状态→颜色映射（保持简单）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3)
  - **Blocks**: T4, T5, T6
  - **Blocked By**: None

  **References**:
  - `src/constants/ai.ts` —— 当前常量
  - `docs/AI对话前端对接文档.md` —— 中文状态标签值

  **Acceptance Criteria**:
  - [ ] 常量文件通过 lint
  - [ ] 新常量被卡片组件引用（可在 Wave 2 验证）

  **QA Scenarios**:

  ```
  Scenario: Constants are importable and typed
    Tool: Bash (node)
    Steps:
      1. Import constants from '@/constants/ai'
      2. Verify AI_CHAT_COPY.viewOrder and AI_CHAT_COPY.viewTicket exist
    Expected Result: No runtime errors
    Evidence: .sisyphus/evidence/t2-constants-import.log
  ```

  **Commit**: NO (group with Wave 2)

---

- [ ] T3. 新增/更新格式化工具函数

  **What to do**:
  - 检查 `src/utils/format.ts` 是否已有 `formatPrice()` 和日期格式化函数
  - 评估是否需要新增：
    - `formatPriceRange(min, max)`：当 min === max 时显示单个价格，否则显示 `¥min — ¥max`
    - `formatDateTimeRange(start, end)`：当 start 和 end 在同一天时显示 `2026.5.1 19:30 — 22:00`，跨天时显示完整日期
  - 如果现有工具够用，仅更新；如果需要新增，保持纯函数风格

  **Must NOT do**:
  - 不改现有 `formatPrice()` 行为（避免影响其他页面）
  - 不引入 date-fns/dayjs 新用法（项目已有 dayjs）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2)
  - **Blocks**: T4, T5, T6
  - **Blocked By**: None

  **References**:
  - `src/utils/format.ts` —— 现有格式化函数
  - `src/utils/__tests__/format.test.ts`（如有）—— 现有测试
  - `docs/AI对话前端对接文档.md` —— 价格和时间显示要求

  **Acceptance Criteria**:
  - [ ] `formatPriceRange(12800, 28000)` → `¥128.00 — ¥280.00`
  - [ ] `formatPriceRange(12800, 12800)` → `¥128.00`
  - [ ] 时间区间格式化符合文档示意

  **QA Scenarios**:

  ```
  Scenario: Price range formatting
    Tool: Bash (node)
    Steps:
      1. Import formatPriceRange from '@/utils/format'
      2. Call with min=12800, max=28000
      3. Call with min=12800, max=12800
    Expected Result: '¥128.00 — ¥280.00' and '¥128.00'
    Evidence: .sisyphus/evidence/t3-price-range.log
  ```

  **Commit**: NO (group with Wave 2)

---

- [ ] T4. `AIChatEventCard` 组件（助手场景 — 活动卡片）

  **What to do**:
  - 基于现有 `AIEventRecommendationCard.vue` 重构或新建 `AIChatEventCard.vue`
  - UI 布局参考 `docs/AI对话前端对接文档.md` 中的活动卡片示意：
    - 封面图（`coverUrl`）
    - 活动名称（`name`）
    - 艺人名（`participantName`，如有）
    - 城市和场馆（`cityNameSnapshot` + `venueNameSnapshot`）
    - 时间区间（`firstSessionStartAt` — `lastSessionEndAt`）
    - 价格区间（`minPrice` — `maxPrice`，使用 `formatPriceRange`）
    - 底部按钮"去购票"，跳转 `/detail/${id}`
  - 可选字段为空时隐藏对应行（不显示空白）
  - 使用 `RouterLink` 包裹整卡，保持可点击

  **Must NOT do**:
  - 不硬编码旧字段名（`title`, `subtitle`, `amount`, `time`）
  - 不处理 `order` / `ticket` 类型逻辑

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `shadcn-vue`, `vue-best-practices`
  - Reason: UI 组件开发，需要匹配 shadcn-vue 风格和 Tailwind CSS v4

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T5, T6, T7)
  - **Blocks**: T8
  - **Blocked By**: T1, T2, T3

  **References**:
  - `docs/AI对话前端对接文档.md` —— 活动卡片字段和示意
  - `src/components/features/ai/AIEventRecommendationCard.vue` —— 现有实现（可作为起点）
  - `src/utils/format.ts` —— 价格/日期格式化
  - `src/constants/ai.ts` —— 文案

  **Acceptance Criteria**:
  - [ ] 组件接收 `item: AiChatEventItem` prop
  - [ ] 所有文档定义字段正确渲染
  - [ ] 可选字段为空时不显示空白行
  - [ ] 点击跳转 `/detail/${id}`
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Event card renders all fields
    Tool: Playwright
    Preconditions: Dev server running (npm run dev)
    Steps:
      1. Navigate to /ai
      2. Send a message that triggers assistant mode with event items
      3. Wait for AI response with items
      4. Screenshot the event card
      5. Assert: card contains event name, participant name, city, venue, time range, price range
      6. Assert: "去购票" button visible and links to /detail/{id}
    Expected Result: Card renders correctly with all fields
    Failure Indicators: Missing fields, broken image, wrong link
    Evidence: .sisyphus/evidence/t4-event-card.png

  Scenario: Event card with optional fields missing
    Tool: Playwright
    Steps:
      1. Mock AI response with event item where participantName, cityNameSnapshot are empty
      2. Assert: empty fields do not create blank rows
    Expected Result: Card renders cleanly without blank spaces
    Evidence: .sisyphus/evidence/t4-event-card-minimal.png
  ```

  **Commit**: NO (group with Wave 2)

---

- [ ] T5. `AIChatOrderCard` 组件（客服场景 — 订单卡片）

  **What to do**:
  - 新建 `AIChatOrderCard.vue`
  - UI 布局参考 `docs/AI对话前端对接文档.md` 中的订单卡片示意：
    - 封面图（`eventCoverUrlSnapshot`）
    - 活动名称（`eventNameSnapshot`）
    - 场馆（`venueNameSnapshot`）
    - 场次时间（`sessionStartAtSnapshot`）
    - 金额 × 数量（如 `¥256.00 × 2张`）
    - 分隔线
    - 订单号 + 状态标签（`orderNo` + `statusLabel`，Badge 样式）
    - 底部按钮"查看订单"，跳转 `/checkout/${id}`
  - 使用 `RouterLink` 包裹整卡

  **Must NOT do**:
  - 不复用活动卡片的 UI 布局（订单卡片有分隔线和双行底部结构）
  - 不处理 `event` / `ticket` 类型

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `shadcn-vue`, `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T4, T6, T7)
  - **Blocks**: T8
  - **Blocked By**: T1, T2, T3

  **References**:
  - `docs/AI对话前端对接文档.md` —— 订单卡片字段和示意
    - `src/utils/format.ts` —— `formatPrice()`（÷100）
    - `src/constants/ai.ts` —— "查看订单"文案

  **Acceptance Criteria**:
  - [ ] 组件接收 `item: AiChatOrderItem` prop
  - [ ] 金额 × 数量正确显示（如 `¥256.00 × 2张`）
  - [ ] 订单号和状态标签在分隔线下方
  - [ ] 点击跳转 `/checkout/${id}`
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Order card renders correctly
    Tool: Playwright
    Preconditions: Dev server running, user logged in
    Steps:
      1. Navigate to /ai?mode=support
      2. Send "查询我的订单"
      3. Wait for AI response with order items
      4. Screenshot order card
      5. Assert: event name, venue, time, price × quantity visible
      6. Assert: orderNo and statusLabel visible below separator
      7. Assert: "查看订单" button links to /checkout/{id}
    Expected Result: Order card matches backend doc mockup
    Evidence: .sisyphus/evidence/t5-order-card.png
  ```

  **Commit**: NO (group with Wave 2)

---

- [ ] T6. `AIChatTicketCard` 组件（客服场景 — 电子票卡片）

  **What to do**:
  - 新建 `AIChatTicketCard.vue`
  - UI 布局参考 `docs/AI对话前端对接文档.md` 中的电子票卡片示意：
    - 封面图（`eventCoverUrlSnapshot`）
    - 活动名称（`eventNameSnapshot`）
    - 场馆（`venueNameSnapshot`）
    - 场次时间（`sessionStartAtSnapshot`）
    - 购票人（`passengerNameSnapshot`）
    - 分隔线
    - 票号 + 状态标签（`ticketNo` + `statusLabel`，Badge 样式）
    - 底部按钮"查看电子票"，跳转 `/ticket/${id}`
  - 使用 `RouterLink` 包裹整卡

  **Must NOT do**:
  - 不复用订单卡片（虽然结构相似，但字段不同，保持独立便于维护）
  - 不处理 `event` / `order` 类型

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `shadcn-vue`, `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T4, T5, T7)
  - **Blocks**: T8
  - **Blocked By**: T1, T2, T3

  **References**:
  - `docs/AI对话前端对接文档.md` —— 电子票卡片字段和示意
  - `src/utils/format.ts`
  - `src/constants/ai.ts` —— "查看电子票"文案

  **Acceptance Criteria**:
  - [ ] 组件接收 `item: AiChatTicketItem` prop
  - [ ] 购票人姓名正确显示
  - [ ] 票号和状态标签在分隔线下方
  - [ ] 点击跳转 `/ticket/${id}`
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Ticket card renders correctly
    Tool: Playwright
    Preconditions: Dev server running, user logged in
    Steps:
      1. Navigate to /ai?mode=support
      2. Send "我的电子票"
      3. Wait for AI response with ticket items
      4. Screenshot ticket card
      5. Assert: event name, venue, time, passenger name visible
      6. Assert: ticketNo and statusLabel visible below separator
      7. Assert: "查看电子票" button links to /ticket/{id}
    Expected Result: Ticket card matches backend doc mockup
    Evidence: .sisyphus/evidence/t6-ticket-card.png
  ```

  **Commit**: NO (group with Wave 2)

---

- [ ] T7. 更新 `features/ai/index.ts` barrel export

  **What to do**:
  - 修改 `src/components/features/ai/index.ts`
  - 新增导出 `AIChatEventCard`、`AIChatOrderCard`、`AIChatTicketCard`
  - 保留 `AIEventRecommendationCard` 导出（在 T8 完成前不要移除，避免破坏其他引用）

  **Must NOT do**:
  - 不删除旧组件文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T4, T5, T6)
  - **Blocks**: T8
  - **Blocked By**: T4, T5, T6

  **Acceptance Criteria**:
  - [ ] Barrel export 包含所有新组件
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Barrel exports are valid
    Tool: Bash (node)
    Steps:
      1. Import { AIChatEventCard, AIChatOrderCard, AIChatTicketCard } from '@/components/features/ai'
    Expected Result: No import errors
    Evidence: .sisyphus/evidence/t7-barrel-export.log
  ```

  **Commit**: NO (group with Wave 3)

---

- [ ] T8. 更新 `AIChatMessageList` 卡片渲染分发逻辑

  **What to do**:
  - 修改 `src/components/features/ai/AIChatMessageList.vue`
  - 将原有的 `<AIEventRecommendationCard v-for="item in msg.items" :key="item.id" :item="item" />`
    替换为根据 `item.type` 分发的逻辑：
    - `type === 'event'` → `<AIChatEventCard :item="item" />`
    - `type === 'order'` → `<AIChatOrderCard :item="item" />`
    - `type === 'ticket'` → `<AIChatTicketCard :item="item" />`
    - 未知 type → 不渲染卡片（或渲染一个占位提示）
  - 使用 `<component :is="...">` 或 `v-if` 链实现分发
  - 确保 TypeScript 类型 narrowing 正确工作

  **Must NOT do**:
  - 不改消息气泡、suggestions、loading 状态的渲染逻辑
  - 不改 scrollToBottom 逻辑
  - 不删除旧组件导入（保留直到最终验证完成）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential, after Wave 2)
  - **Blocks**: T9
  - **Blocked By**: T4, T5, T6, T7

  **References**:
  - `src/components/features/ai/AIChatMessageList.vue` —— 当前实现
  - `src/components/features/ai/index.ts` —— 新组件导出
  - `src/api/ai/types.ts` —— discriminated union 类型

  **Acceptance Criteria**:
  - [ ] 三种 type 正确渲染对应卡片组件
  - [ ] 未知 type 不报错、不崩溃
  - [ ] TypeScript narrowing 无错误
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Message list dispatches correct card by type
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /ai
      2. Mock AI response with mixed items: one event, one order, one ticket
      3. Assert: event card rendered for type=event
      4. Assert: order card rendered for type=order
      5. Assert: ticket card rendered for type=ticket
    Expected Result: Each item renders its corresponding card component
    Evidence: .sisyphus/evidence/t8-dispatch-mixed.png

  Scenario: Unknown type fallback
    Tool: Playwright
    Steps:
      1. Mock AI response with item type = 'unknown'
      2. Assert: no card rendered, no console error, message text still displays
    Expected Result: Graceful fallback, no runtime errors
    Evidence: .sisyphus/evidence/t8-unknown-type.png
  ```

  **Commit**: NO (group with Wave 3)

---

- [ ] T9. 更新 `useAIChat.test.ts` mock 数据并运行测试

  **What to do**:
  - 修改 `src/composables/ai/__tests__/useAIChat.test.ts`
  - 更新 mock 数据中的 items 字段，从旧 flat 结构改为新 discriminated union 结构
  - 确保测试中使用的 mock AI 响应包含正确的 `type` 字段和新的 camelCase 字段名
  - 运行 `npm run test` 验证通过
  - 如有需要，更新测试断言以匹配新的数据结构

  **Must NOT do**:
  - 不改 composable 业务逻辑（只改 mock 数据和断言）
  - 不删除现有测试用例

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-testing-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with T8)
  - **Blocks**: F1-F4
  - **Blocked By**: T8

  **References**:
  - `src/composables/ai/__tests__/useAIChat.test.ts` —— 现有测试
  - `src/api/ai/types.ts` —— 新类型定义

  **Acceptance Criteria**:
  - [ ] 所有 mock 数据使用新的 discriminated union 字段
  - [ ] `npm run test` 通过零失败
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: Tests pass with new mock data
    Tool: Bash
    Steps:
      1. Run `npm run test -- useAIChat`
      2. Assert: all tests pass (0 failures)
      3. Assert: no TypeScript errors in test files
    Expected Result: Test suite passes
    Evidence: .sisyphus/evidence/t9-test-results.log
  ```

  **Commit**: YES (Wave 3 commit)
  - Message: `feat(ai): split AI chat cards into event/order/ticket components`
  - Files: `src/api/ai/types.ts`, `src/components/features/ai/*.vue`, `src/components/features/ai/index.ts`, `src/constants/ai.ts`, `src/utils/format.ts`, `src/composables/ai/__tests__/useAIChat.test.ts`
  - Pre-commit: `npm run type-check && npm run test -- useAIChat`

---

- [ ] T10. 修复客服卡片封面图比例被挤压问题

  **What to do**:
  - 修改三个卡片组件中的封面图结构，给 `<img>` 外层包裹 `<div class="shrink-0">`
  - 从 `img` 上移除 `shrink-0`，移到外层 `div`
  - 确保图片的 `aspect-[3/4]` 不受右侧 flex 内容高度影响

  **修复前** (当前问题代码):

  ```vue
  <img
    :src="item.coverUrl || ''"
    class="aspect-[3/4] h-auto w-20 shrink-0 rounded-lg object-cover"
  />
  ```

  **修复后**:

  ```vue
  <div class="shrink-0">
    <img
      :src="item.coverUrl || ''"
      class="aspect-[3/4] h-auto w-20 rounded-lg object-cover"
    />
  </div>
  ```

  **需要修改的文件**:
  - `src/components/features/ai/AIChatEventCard.vue`
  - `src/components/features/ai/AIChatOrderCard.vue`
  - `src/components/features/ai/AIChatTicketCard.vue`

  **Why this works**:
  - 原代码中 `shrink-0` 在 `img` 上，但 `h-auto` 在 flex 子元素中高度计算会受父容器 stretch 影响
  - 右侧内容（订单号、状态标签）将卡片撑高后，`img` 的 `aspect-[3/4]` 计算异常
  - 将 `shrink-0` 移到外层 `div`，创建独立的 BFC，图片宽高比不再受 flex 布局影响

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Hotfix (after Wave 3)
  - **Blocked By**: T4, T5, T6

  **Acceptance Criteria**:
  - [ ] 三个卡片组件的图片结构统一修复
  - [ ] 活动卡片和客服卡片的封面图比例视觉上完全一致
  - [ ] `npm run type-check` 通过
  - [ ] `npm run lint:check` 通过
  - [ ] `npm run build` 成功

  **QA Scenarios**:

  ```
  Scenario: All card images have consistent aspect ratio
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /ai (助手模式)
      2. Mock response with event items
      3. Screenshot event card
      4. Navigate to /ai?mode=support (客服模式)
      5. Mock response with order items
      6. Screenshot order card
      7. Compare image dimensions: both should be 80px width with same height (~106px)
    Expected Result: Event and order card images have identical dimensions
    Failure Indicators: Order card image shorter/taller than event card
    Evidence: .sisyphus/evidence/t10-image-ratio-comparison.png
  ```

  **Commit**: YES
  - Message: `fix(ai): isolate card image from flex stretch to preserve aspect ratio`
  - Files: `src/components/features/ai/AIChatEventCard.vue`, `src/components/features/ai/AIChatOrderCard.vue`, `src/components/features/ai/AIChatTicketCard.vue`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `npm run ci` (or at least `npm run type-check`, `npm run lint:check`, `npm run lint:oxlint`, `npm run test`). Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
      Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (all three card types in one message list). Test edge cases: empty items, unknown type, missing optional fields. Save to `.sisyphus/evidence/final-qa/`.
      Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: NO separate commit (types + constants + utils, lightweight)
- **Wave 2**: NO separate commit (card components, grouped)
- **Wave 3**: `feat(ai): split AI chat cards into event/order/ticket components`
  - Files: all modified/added files in Wave 1-3
  - Pre-commit: `npm run type-check && npm run test -- useAIChat`

---

## Success Criteria

### Verification Commands

```bash
npm run type-check    # Expected: 0 errors
npm run test          # Expected: all pass
npm run lint:check    # Expected: 0 errors
npm run lint:oxlint   # Expected: 0 errors
npm run build         # Expected: success
```

### Final Checklist

- [ ] `AiChatItem` 为 discriminated union，TypeScript narrowing 工作正常
- [ ] `AIChatEventCard` 渲染活动卡片所有字段（名称、艺人、城市、场馆、时间、价格区间）
- [ ] `AIChatOrderCard` 渲染订单卡片所有字段（活动名、场馆、时间、金额×数量、订单号、状态）
- [ ] `AIChatTicketCard` 渲染电子票卡片所有字段（活动名、场馆、时间、购票人、票号、状态）
- [ ] `AIChatMessageList` 根据 `type` 正确分发三种卡片
- [ ] 未知 type 不报错、不崩溃
- [ ] 所有实体 ID 为 `string` 类型
- [ ] 路由跳转保持现有行为
- [ ] 测试通过
- [ ] CI 质量门禁通过
