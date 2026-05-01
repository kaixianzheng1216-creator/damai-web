# AI 聊天卡片边距调整计划

## TL;DR

> 统一调整 AI 聊天中三种卡片（Event/Order/Ticket）的内边距、图片文字间距、图片尺寸和卡片间距，解决布局过挤的问题。
>
> **涉及文件**: 4 个 Vue 组件
> **调整方式**: Tailwind CSS 类名修改
> **预计耗时**: 短（Quick）

---

## Context

用户反馈 AI 聊天返回的卡片（订单卡片尤为明显）布局过挤：图片和文字贴得太近、内边距不足、整体空间感差。截图显示卡片 `padding` 和 `gap` 偏小，需要统一放大。

**用户决策**:

- 采用"整体放大"方案：内边距 + 图片文字间距 + 图片尺寸全部增大
- 卡片之间的垂直间距也需要增大

---

## Work Objectives

### Core Objective

将 `AIChatEventCard`、`AIChatOrderCard`、`AIChatTicketCard` 三种卡片以及外层 `AIChatMessageList` 的间距统一调大，提升视觉呼吸感。

### Concrete Deliverables

- `src/components/features/ai/AIChatEventCard.vue` — 样式调整
- `src/components/features/ai/AIChatOrderCard.vue` — 样式调整
- `src/components/features/ai/AIChatTicketCard.vue` — 样式调整
- `src/components/features/ai/AIChatMessageList.vue` — 卡片间距调整

### Must Have

- 三种卡片内边距统一从 `p-3` (12px) 改为 `p-5` (20px)
- 图片与文字间距统一从 `gap-3` (12px) 改为 `gap-5` (20px)
- 图片宽度统一从 `w-20` (80px) 改为 `w-24` (96px)
- 卡片列表间距从 `space-y-3` (12px) 改为 `space-y-5` (20px)
- 调整 `py-0.5` → `py-1` 让右侧内容区垂直更均衡

### Must NOT Have

- 不改变任何业务逻辑、API 调用、数据结构
- 不改卡片功能行为（点击跳转、按钮等）
- 不引入新的类名或样式文件

---

## Verification Strategy

- **无新增测试**：纯样式调整，不涉及逻辑变更
- **QA 方式**：构建通过 + 截图视觉验证
- 运行 `npm run type-check` 和 `npm run build` 确保无编译错误

---

## Execution Strategy

4 个文件的 Tailwind 类名同步调整，全部独立，可并行执行：

```
Wave 1 (全部并行):
├── Task 1: AIChatEventCard.vue 样式调整
├── Task 2: AIChatOrderCard.vue 样式调整
├── Task 3: AIChatTicketCard.vue 样式调整
└── Task 4: AIChatMessageList.vue 卡片间距调整
```

---

## TODOs

- [x] 1. AIChatEventCard.vue — 卡片样式放大

  **What to do**:
  - 修改 `src/components/features/ai/AIChatEventCard.vue`
  - 将根 `<RouterLink>` 的 `p-3` 改为 `p-5`
  - 将根 `<RouterLink>` 的 `gap-3` 改为 `gap-5`
  - 将图片的 `w-20` 改为 `w-24`
  - 将右侧内容区的 `py-0.5` 改为 `py-1`

  **Must NOT do**:
  - 不改变任何业务逻辑或跳转行为
  - 不修改除上述类名外的其他内容

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] 文件修改后 `npm run type-check` 无新增错误
  - [ ] 构建通过

- [x] 2. AIChatOrderCard.vue — 卡片样式放大

  **What to do**:
  - 修改 `src/components/features/ai/AIChatOrderCard.vue`
  - 将根 `<RouterLink>` 的 `p-3` 改为 `p-5`
  - 将根 `<RouterLink>` 的 `gap-3` 改为 `gap-5`
  - 将图片的 `w-20` 改为 `w-24`
  - 将右侧内容区的 `py-0.5` 改为 `py-1`

  **Must NOT do**:
  - 不改变任何业务逻辑或跳转行为

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] 文件修改后 `npm run type-check` 无新增错误

- [x] 3. AIChatTicketCard.vue — 卡片样式放大

  **What to do**:
  - 修改 `src/components/features/ai/AIChatTicketCard.vue`
  - 将根 `<RouterLink>` 的 `p-3` 改为 `p-5`
  - 将根 `<RouterLink>` 的 `gap-3` 改为 `gap-5`
  - 将图片的 `w-20` 改为 `w-24`
  - 将右侧内容区的 `py-0.5` 改为 `py-1`

  **Must NOT do**:
  - 不改变任何业务逻辑或跳转行为

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] 文件修改后 `npm run type-check` 无新增错误

- [x] 4. AIChatMessageList.vue — 卡片列表间距增大

  **What to do**:
  - 修改 `src/components/features/ai/AIChatMessageList.vue`
  - 找到 `msg.items` 渲染区域的 `space-y-3`（第 96 行附近）
  - 将 `space-y-3` 改为 `space-y-5`

  **Must NOT do**:
  - 不改消息气泡本身的间距
  - 不改其他布局结构

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] 文件修改后 `npm run type-check` 无新增错误

- [x] 5. OrderCard / TicketCard — 编号与状态标签防挤压

  **What to do**:
  - 修改 `src/components/features/ai/AIChatOrderCard.vue` 第 42-46 行
  - 修改 `src/components/features/ai/AIChatTicketCard.vue` 第 42-46 行
  - 将 `<div class="flex items-center justify-between">` 改为 `<div class="flex items-start justify-between gap-2">`
  - 给编号 `<p>` 添加 `break-all` 类名
  - 给状态 `<span>` 添加 `shrink-0` 类名

  **Must NOT do**:
  - 不改其他区域布局
  - 不改 EventCard（活动卡片无编号状态行）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] 长编号自动换行，不与状态标签挤压
  - [ ] `npm run type-check` 无新增错误

---

## Final Verification Wave

- [x] F1. **构建检查** — `unspecified-high`
      运行 `npm run type-check` → PASS，运行 `npm run build` → PASS

- [x] F2. **视觉 QA** — `unspecified-high`
      代码审查确认四种文件调整一致，卡片不再拥挤

## Commit Strategy

- 单条 commit：`style(ai-chat): enlarge card padding and spacing`
- 文件：`src/components/features/ai/AIChat*.vue`
- Pre-commit: `npm run type-check`

## Success Criteria

- [x] `npm run type-check` 通过
- [x] `npm run build` 通过
- [x] 卡片内边距、间距、图片尺寸统一增大，视觉上不再拥挤
